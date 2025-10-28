# -*- coding: utf-8 -*-

import time
import logging
import json
import argparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# --- Configuração do Logging ---
# Configura um logger para registrar informações detalhadas sobre a execução do script.
# Os logs são salvos em 'whatsapp_osint.log' e também exibidos no console.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("whatsapp_osint.log"),
        logging.StreamHandler()
    ]
)

class WhatsAppOSINT:
    """
    Classe para realizar OSINT em números de telefone do WhatsApp,
    automatizando a verificação de perfis via WhatsApp Web de forma mais robusta.
    """

    def __init__(self, user_data_dir="user-data-dir"):
        """
        Inicializa o driver do Selenium e configura o ambiente.

        :param user_data_dir: Diretório para salvar a sessão do Chrome, evitando logins repetidos.
        """
        chrome_options = webdriver.ChromeOptions()
        # Salva a sessão do usuário para não precisar escanear o QR code toda vez.
        chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
        # Argumentos para uma navegação mais estável e para evitar detecção.
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")

        try:
            # Tenta instalar ou carregar o ChromeDriver a partir do cache.
            driver_path = ChromeDriverManager().install()
            service = Service(driver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            logging.info("WebDriver inicializado com sucesso.")
        except Exception as e:
            # Captura erros comuns, como a não instalação do Chrome.
            logging.error(f"Erro ao inicializar o WebDriver. Verifique se o Google Chrome está instalado. Erro: {e}")
            raise

    def aguardar_login(self, timeout=120):
        """
        Aguarda o usuário fazer login escaneando o QR Code.
        O login é considerado bem-sucedido quando a interface principal do WhatsApp é carregada.

        :param timeout: Tempo máximo de espera para o login (em segundos).
        """
        logging.info("Acessando WhatsApp Web. Por favor, escaneie o QR Code se for sua primeira vez.")
        logging.info("Se uma sessão já estiver salva, o login será automático.")
        self.driver.get("https://web.whatsapp.com")

        try:
            # Em vez de um ID frágil, aguardamos por um seletor mais estável que indica que a interface carregou.
            # 'landing-wrapper' é um bom indicador da tela de QR code ou da tela principal.
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='landing-wrapper'], div[data-testid='app']"))
            )

            # Agora, verificamos se o login já foi feito ou se o QR code está presente.
            # Se o painel de conversas ('app') estiver visível, o login está ativo.
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='app']"))
            )
            logging.info("Login realizado com sucesso! Interface principal carregada.")
        except TimeoutException:
            logging.error("Tempo de login esgotado. Não foi possível autenticar no WhatsApp Web.")
            self.fechar()
            raise

    def buscar_numero(self, numero_telefone_br):
        """
        Busca por um número de telefone brasileiro e retorna as informações do perfil.

        :param numero_telefone_br: Número de telefone no formato brasileiro (ex: 5511999999999).
        :return: Um dicionário com os dados do perfil ou informações de erro.
        """
        resultado = {
            "numero_pesquisado": numero_telefone_br,
            "conta_existente": False,
            "dados_perfil": None,
            "erro": None
        }

        try:
            logging.info(f"Iniciando a busca pelo número: {numero_telefone_br}")
            # Rate limiting: pausa para simular comportamento humano.
            time.sleep(5)

            url_whatsapp = f"https://web.whatsapp.com/send?phone={numero_telefone_br}&text&app_absent=0"
            self.driver.get(url_whatsapp)

            # --- Lógica de verificação de conta ---
            # A nova interface do WhatsApp mostra uma mensagem de erro ou carrega o perfil.
            # Vamos aguardar por um dos dois resultados.
            try:
                # SUCESSO: O cabeçalho da conversa carrega, indicando que a conta existe.
                # Usamos um seletor de 'data-testid' que é mais estável que XPaths.
                header_selector = "header[data-testid='chat-header']"
                WebDriverWait(self.driver, 25).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, header_selector))
                )
                logging.info(f"Conta para o número {numero_telefone_br} encontrada. Coletando dados...")

                # Clica no cabeçalho para abrir as informações do perfil.
                self.driver.find_element(By.CSS_SELECTOR, header_selector).click()

                resultado["conta_existente"] = True
                dados = self._extrair_dados_do_painel()
                resultado["dados_perfil"] = dados
                logging.info(f"Dados coletados para {numero_telefone_br}: {json.dumps(dados)}")

            except TimeoutException:
                # ERRO: Se o cabeçalho não carregar, verificamos a mensagem de número inválido.
                try:
                    # Seletor para o pop-up de erro "O número de telefone não existe..."
                    error_selector = "div[data-testid='confirm-popup']"
                    error_element = WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, error_selector))
                    )
                    error_text = error_element.text
                    logging.warning(f"O número {numero_telefone_br} é inválido ou não possui WhatsApp. Mensagem: '{error_text}'")
                    resultado["erro"] = "Número de telefone inválido ou não cadastrado no WhatsApp."
                except TimeoutException:
                    # Se nenhum dos dois acontecer, pode ser um erro de carregamento.
                    resultado["erro"] = "Não foi possível confirmar a existência da conta. A página pode não ter carregado corretamente."
                    logging.error(resultado["erro"])

        except Exception as e:
            resultado["erro"] = f"Um erro inesperado ocorreu durante a busca: {str(e)}"
            logging.critical(resultado["erro"], exc_info=True)

        return resultado

    def _extrair_dados_do_painel(self):
        """
        Função auxiliar para extrair nome, recado e URL da foto do perfil do painel de contato.
        Usa seletores mais estáveis para encontrar os elementos.
        """
        dados_perfil = {"nome": None, "recado": None, "url_foto_perfil": None}

        try:
            # Aguarda o painel de informações do contato abrir (o seletor é para o painel em si).
            panel_selector = "div[data-testid='contact-info-drawer']"
            WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, panel_selector))
            )
            time.sleep(2) # Pausa para garantir que o conteúdo do painel seja renderizado.

            # Extrai a URL da foto do perfil
            try:
                # Seletor para a imagem de perfil dentro do painel.
                img_selector = "div[data-testid='contact-info-drawer'] img"
                img_element = self.driver.find_element(By.CSS_SELECTOR, img_selector)
                dados_perfil["url_foto_perfil"] = img_element.get_attribute("src")
            except NoSuchElementException:
                logging.warning("Não foi possível encontrar a foto do perfil.")

            # Extrai o nome do perfil
            try:
                # O nome está em um elemento específico dentro do painel.
                # Este seletor busca um elemento de 'span' que contém o título do painel.
                nome_selector = "h2[data-testid='contact-info-drawer-name'] span[dir='auto']"
                nome_element = self.driver.find_element(By.CSS_SELECTOR, nome_selector)
                dados_perfil["nome"] = nome_element.text
            except NoSuchElementException:
                logging.warning("Não foi possível encontrar o nome do perfil.")

            # Extrai o recado (status) do perfil
            try:
                # O recado está em uma seção específica. Este seletor é mais robusto.
                recado_selector = "div[data-testid='contact-info-drawer-about'] span[dir='auto']"
                recado_element = self.driver.find_element(By.CSS_SELECTOR, recado_selector)
                dados_perfil["recado"] = recado_element.text
            except NoSuchElementException:
                logging.warning("Não foi possível encontrar o recado do perfil.")

        except Exception as e:
            logging.error(f"Erro ao extrair dados do painel do perfil: {e}", exc_info=True)

        return dados_perfil

    def fechar(self):
        """Fecha o navegador e encerra a sessão do WebDriver."""
        if hasattr(self, 'driver') and self.driver:
            self.driver.quit()
            logging.info("Sessão do WebDriver encerrada.")

def main():
    """
    Função principal para executar o script a partir da linha de comando.
    """
    parser = argparse.ArgumentParser(
        description="Ferramenta OSINT para WhatsApp.",
        epilog="Exemplo: python whatsapp_osint.py 5511999999999"
    )
    parser.add_argument("numero", help="O número de telefone a ser pesquisado (formato BR: 5511999999999).")

    args = parser.parse_args()

    # Validação do formato do número.
    if not (args.numero.isdigit() and args.numero.startswith('55') and len(args.numero) > 12):
        logging.error("Formato de número inválido. Use apenas dígitos, no formato brasileiro completo: 55DDNNNNNNNNN.")
        return

    osint_whatsapp = None
    try:
        osint_whatsapp = WhatsAppOSINT()
        osint_whatsapp.aguardar_login()

        resultado = osint_whatsapp.buscar_numero(args.numero)

        # Imprime o resultado final em formato JSON.
        print(json.dumps(resultado, indent=4, ensure_ascii=False))

    except Exception as e:
        logging.critical(f"Falha crítica na execução: {e}", exc_info=True)
    finally:
        if osint_whatsapp:
            osint_whatsapp.fechar()

if __name__ == "__main__":
    main()