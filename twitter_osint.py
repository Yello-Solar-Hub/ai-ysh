# -*- coding: utf-8 -*-

import json
import logging
import random
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# --- Configuração do Logging ---
# Configura um sistema de logging para registrar informações detalhadas sobre a execução do script.
# Isso é útil para depuração e para entender o fluxo de operações.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("twitter_osint.log"),
        logging.StreamHandler()
    ]
)

class TwitterOSINT:
    """
    Classe para realizar OSINT (Open Source Intelligence) no Twitter/X,
    focando na busca de perfis associados a números de telefone brasileiros.
    """

    def __init__(self):
        """
        Inicializa o scraper, configurando o driver do Selenium.
        """
        logging.info("Inicializando o driver do Selenium...")
        try:
            # Configura as opções do Chrome para um modo mais "stealth"
            chrome_options = webdriver.ChromeOptions()
            chrome_options.add_argument("--headless")  # Executar em modo headless (sem interface gráfica)
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--start-maximized")
            chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

            # Instala e gerencia o driver do Chrome automaticamente
            self.driver = webdriver.Chrome(
                service=ChromeService(ChromeDriverManager().install()),
                options=chrome_options
            )
            logging.info("Driver do Selenium inicializado com sucesso.")
        except Exception as e:
            logging.error(f"Falha ao inicializar o Selenium: {e}")
            raise

    def _aplicar_rate_limit(self, min_delay=5, max_delay=15):
        """
        Aplica um atraso aleatório para simular comportamento humano e evitar bloqueios.
        """
        delay = random.uniform(min_delay, max_delay)
        logging.info(f"Aguardando {delay:.2f} segundos para evitar bloqueio (rate limiting).")
        time.sleep(delay)

    def _tratar_captcha(self):
        """
        Placeholder para lógica de tratamento de CAPTCHA.
        Em um cenário real, isso poderia envolver serviços de terceiros ou intervenção manual.
        """
        # Exemplo: verificar se um elemento de CAPTCHA está visível
        try:
            captcha_element = self.driver.find_element(By.ID, "arkose_iframe")
            if captcha_element.is_displayed():
                logging.warning("CAPTCHA detectado. O script irá pausar.")
                # A lógica aqui seria mais complexa, talvez notificando o usuário.
                # Por enquanto, apenas registramos e esperamos.
                input("Por favor, resolva o CAPTCHA manualmente e pressione Enter para continuar...")
                return True
        except:
            # Nenhum CAPTCHA encontrado
            return False
        return False


    def buscar_por_telefone(self, numero_telefone):
        """
        Verifica se um número de telefone está associado a uma conta do Twitter/X.
        Utiliza a página de recuperação de senha para fazer a verificação.

        :param numero_telefone: String com o número de telefone (ex: "+5511999998888")
        :return: Dicionário com informações do perfil, se encontrado.
        """
        logging.info(f"Iniciando busca pelo telefone: {numero_telefone}")
        url_recuperacao = "https://x.com/account/begin_password_reset"
        resultado = {
            "telefone": numero_telefone,
            "encontrado": False,
            "username_parcial": None,
            "detalhes": "Nenhum perfil encontrado para este telefone."
        }

        try:
            self.driver.get(url_recuperacao)
            self._aplicar_rate_limit(2, 5) # Delay inicial

            # Aguarda o campo de entrada estar presente e visível
            wait = WebDriverWait(self.driver, 20)
            campo_busca = wait.until(EC.visibility_of_element_located((By.NAME, "identity")))

            # Insere o número de telefone e avança
            campo_busca.send_keys(numero_telefone)
            campo_busca.send_keys(Keys.RETURN)
            logging.info("Número de telefone inserido. Aguardando resposta...")

            self._aplicar_rate_limit() # Delay após a ação principal

            # Tratamento de CAPTCHA
            if self._tratar_captcha():
                 # Tenta novamente após o CAPTCHA ser resolvido
                 campo_busca = wait.until(EC.visibility_of_element_located((By.NAME, "identity")))
                 campo_busca.clear()
                 campo_busca.send_keys(numero_telefone)
                 campo_busca.send_keys(Keys.RETURN)
                 self._aplicar_rate_limit()


            # --- Validação de Resultados ---
            # O Twitter pode responder de várias formas. Precisamos verificar qual cenário ocorreu.

            # Cenário 1: Conta encontrada. O Twitter mostra uma página de confirmação.
            try:
                # O Twitter/X pode mostrar o nome de usuário ou uma mensagem de confirmação.
                # O seletor exato pode mudar, então usamos uma busca por texto.
                wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Confirm your identity')] | //*[contains(text(), 'Verifique sua identidade')]")))

                # Se a conta existe, o Twitter/X pode ofuscar o nome de usuário, mas a confirmação já é um resultado positivo.
                # Tentamos extrair qualquer informação útil.
                resultado["encontrado"] = True
                resultado["detalhes"] = "Um perfil foi encontrado para este número. O Twitter/X não revela mais o username completo nesta etapa."
                logging.info(f"Sucesso! Conta encontrada para o telefone {numero_telefone}.")

                # Tentativa de extrair username parcial (pode não funcionar sempre)
                try:
                    # O seletor exato pode variar. Inspecione a página para o seletor correto.
                    user_info_element = self.driver.find_element(By.CSS_SELECTOR, '[data-testid="ocf-challenge-direction"]')
                    resultado["username_parcial"] = user_info_element.text
                except Exception:
                    logging.warning("Não foi possível extrair o username parcial.")

            # Cenário 2: Conta não encontrada.
            except Exception:
                 try:
                    # Procuramos por uma mensagem de erro comum
                    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'não encontramos uma conta')] | //*[contains(text(), 'we couldn’t find your account')]")))
                    logging.info(f"Nenhuma conta encontrada para o telefone {numero_telefone}.")
                    # O resultado padrão já indica que não foi encontrado.
                 except Exception:
                    # Cenário 3: Outro erro ou mudança na interface
                    logging.error("Não foi possível determinar se a conta existe. A página pode ter mudado.")
                    resultado["detalhes"] = "Erro inesperado. A interface do Twitter/X pode ter mudado ou um erro de rede ocorreu."


        except Exception as e:
            logging.error(f"Ocorreu um erro durante a busca por telefone: {e}")
            resultado["detalhes"] = f"Erro de execução: {str(e)}"

        return resultado

    def buscar_por_username(self, username):
        """
        Verifica se um perfil de usuário existe no Twitter/X.

        :param username: O @username a ser verificado.
        :return: Dicionário com o status da verificação.
        """
        logging.info(f"Verificando a existência do username: @{username}")
        url_perfil = f"https://x.com/{username}"
        resultado = {
            "username": username,
            "existe": False,
            "url_perfil": url_perfil,
            "detalhes": "Perfil não encontrado ou a página não pôde ser carregada."
        }

        try:
            self.driver.get(url_perfil)
            self._aplicar_rate_limit(3, 7)

            # A forma mais confiável de verificar se um perfil existe é checar o título da página
            # ou a presença de um elemento específico de erro "Essa conta não existe".
            page_title = self.driver.title.lower()

            # Se a página de erro é carregada, o título geralmente contém "Profile" ou "Perfil"
            # mas a página de "não existe" tem um conteúdo específico.
            # Vamos procurar pelo elemento de erro.
            try:
                wait = WebDriverWait(self.driver, 10)
                # O seletor pode mudar. Este é um exemplo.
                wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Essa conta não existe')] | //*[contains(text(), 'This account doesn’t exist')]")))
                logging.info(f"O perfil @{username} não existe.")
                # O resultado padrão já está correto.
            except Exception:
                # Se o elemento de erro não aparece, o perfil provavelmente existe.
                logging.info(f"Perfil @{username} encontrado.")
                resultado["existe"] = True
                resultado["detalhes"] = "O perfil parece existir."

        except Exception as e:
            logging.error(f"Erro ao verificar o username @{username}: {e}")
            resultado["detalhes"] = f"Erro de execução: {str(e)}"

        return resultado


    def fechar(self):
        """
        Fecha o driver do Selenium de forma segura.
        """
        if self.driver:
            logging.info("Fechando o driver do Selenium.")
            self.driver.quit()

# --- Exemplo de Uso ---
def main():
    """
    Função principal para demonstrar o uso da classe TwitterOSINT.
    """
    print("--- Twitter/X OSINT Script ---")
    print("AVISO: Este script realiza scraping e deve ser usado de forma ética e responsável.")
    print("Respeite os termos de serviço do Twitter/X e a privacidade alheia.\n")

    # O número deve estar no formato internacional completo, com código do país e DDD.
    # Exemplo para um número de São Paulo, Brasil.
    telefone_alvo = "+5511912345678" # Substitua pelo número alvo

    # --- Padrões de Username Comuns ---
    # Você pode gerar uma lista de usernames baseada em nomes, apelidos, etc.
    usernames_para_testar = [
        "usuario_exemplo_123", # Username que provavelmente não existe
        "elonmusk"             # Username que sabemos que existe
    ]

    osint = None
    try:
        osint = TwitterOSINT()

        # 1. Busca por número de telefone
        print(f"\n[+] Buscando pelo telefone: {telefone_alvo}")
        resultado_telefone = osint.buscar_por_telefone(telefone_alvo)
        print("\n--- Resultado da Busca por Telefone ---")
        print(json.dumps(resultado_telefone, indent=4, ensure_ascii=False))

        # 2. Busca por lista de usernames
        print("\n[+] Verificando lista de usernames...")
        resultados_username = []
        for user in usernames_para_testar:
            resultado_user = osint.buscar_por_username(user)
            resultados_username.append(resultado_user)
            print(f"  - @{user}: {'Existe' if resultado_user['existe'] else 'Não encontrado'}")

        print("\n--- Resultados da Verificação de Usernames ---")
        print(json.dumps(resultados_username, indent=4, ensure_ascii=False))

    except Exception as e:
        logging.critical(f"Ocorreu um erro crítico no script: {e}")
    finally:
        if osint:
            osint.fechar()
        print("\nScript finalizado.")


if __name__ == "__main__":
    main()