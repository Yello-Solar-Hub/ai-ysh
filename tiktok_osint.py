# -*- coding: utf-8 -*-
"""
Ferramenta de OSINT para TikTok com foco em números de telefone brasileiros.

AVISO LEGAL E ÉTICO:
Este script foi desenvolvido para fins educacionais e de pesquisa em segurança (OSINT).
O usuário é totalmente responsável por seu uso. Acessar informações sem permissão
pode violar os Termos de Serviço do TikTok e a legislação local de privacidade de dados (como a LGPD no Brasil).
Use esta ferramenta de forma ética e responsável, apenas em alvos com autorização explícita
ou em investigações legítimas. O autor não se responsabiliza por qualquer mau uso.

COMO FUNCIONA (VERSÃO SELENIUM):
1.  Este script agora usa Selenium para controlar um navegador Chrome real (em modo headless).
    Isso torna as requisições muito mais difíceis de serem detectadas como um bot,
    ajudando a contornar CAPTCHAs e outras proteções.
2.  Gera uma lista de nomes de usuário (usernames) potenciais a partir de um número de telefone.
3.  Para cada username, o navegador acessa a página do perfil.
4.  O script verifica se a página carregada é um perfil válido ou uma página de "não encontrado".
5.  Se o perfil for válido, ele extrai o código-fonte HTML completo da página renderizada.
6.  Os dados do perfil são extraídos de uma tag <script> que contém um objeto JSON com
    todas as informações públicas.
7.  Todo o processo inclui pausas para não sobrecarregar os servidores do TikTok.
"""

import json
import time
import logging
import random
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# --- Dependências do Selenium ---
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, WebDriverException

# --- Configuração do Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

class TikTokOSINT:
    """
    Classe principal para realizar a investigação OSINT no TikTok usando Selenium.
    """
    BASE_URL = "https://www.tiktok.com/"

    def __init__(self, rate_limit_delay_seconds: int = 5):
        """
        Inicializa a classe e o WebDriver do Selenium.

        :param rate_limit_delay_seconds: Tempo de espera entre as requisições.
        """
        self.delay = lambda: time.sleep(rate_limit_delay_seconds + random.uniform(0.5, 2.0))
        self.driver = self._setup_driver()
        logging.info("Instância de TikTokOSINT (Selenium) criada e WebDriver configurado.")

    def _setup_driver(self) -> webdriver.Chrome | None:
        """Configura e inicializa o WebDriver do Chrome."""
        try:
            logging.info("Configurando o WebDriver do Chrome...")
            chrome_options = Options()
            chrome_options.add_argument("--headless")  # Roda o Chrome em modo "invisível"
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--log-level=3") # Suprime logs desnecessários do Chrome
            chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36")

            # Instala ou usa o chromedriver em cache
            service = ChromeService(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            driver.set_page_load_timeout(20) # Define um timeout para o carregamento da página
            logging.info("WebDriver configurado com sucesso.")
            return driver
        except (WebDriverException, ValueError) as e:
            logging.error(f"Erro ao configurar o WebDriver do Selenium: {e}")
            logging.error("Certifique-se de que o Google Chrome está instalado no sistema.")
            return None

    def _get_page_source(self, url: str) -> str | None:
        """
        Acessa uma URL com o Selenium e retorna o código-fonte da página.

        :param url: URL a ser acessada.
        :return: Código-fonte da página ou None em caso de erro.
        """
        if not self.driver:
            logging.error("WebDriver não está disponível.")
            return None

        try:
            self.delay() # Aplica o rate limiting
            logging.info(f"Acessando URL: {url}")
            self.driver.get(url)
            # Verifica se a página indica que o usuário não foi encontrado
            if "Couldn't find this account" in self.driver.title or "Page not found" in self.driver.title:
                logging.info(f"Página de 'usuário não encontrado' detectada em {url}.")
                return None
            return self.driver.page_source
        except TimeoutException:
            logging.warning(f"Timeout ao carregar a URL: {url}")
            return None
        except WebDriverException as e:
            logging.error(f"Erro do WebDriver ao acessar {url}: {e}")
            return None

    def scrape_profile_data(self, username: str) -> dict | None:
        """
        Extrai dados públicos de um perfil do TikTok usando Selenium e BeautifulSoup.

        :param username: O nome de usuário do qual extrair os dados.
        :return: Um dicionário com os dados estruturados ou None se falhar.
        """
        profile_url = urljoin(self.BASE_URL, f"@{username}")
        logging.info(f"Iniciando scraping do perfil: {username}")

        html_content = self._get_page_source(profile_url)
        if not html_content:
            return None

        soup = BeautifulSoup(html_content, 'html.parser')

        # O seletor-alvo para os dados do perfil em formato JSON.
        script_tag = soup.find('script', {'id': '__UNIVERSAL_DATA_FOR_REHYDRATION__'})
        if not script_tag:
            logging.warning(f"Não foi possível encontrar a tag '__UNIVERSAL_DATA_FOR_REHYDRATION__' no perfil de {username}. A estrutura do site pode ter mudado.")
            return None

        try:
            data = json.loads(script_tag.string)
            user_info_scope = data.get("__DEFAULT_SCOPE__", {}).get("webapp.user-detail", {})

            user_data = user_info_scope.get("userInfo", {}).get("user", {})
            stats_data = user_info_scope.get("userInfo", {}).get("stats", {})

            if not user_data or not stats_data:
                logging.warning(f"Estrutura de dados do usuário ('userInfo') não encontrada no JSON para {username}.")
                return None

            profile_info = {
                "username": user_data.get("uniqueId"),
                "nickname": user_data.get("nickname"),
                "avatar_url": user_data.get("avatarLarger"),
                "signature": user_data.get("signature"),
                "is_verified": user_data.get("verified"),
                "is_private": user_data.get("privateAccount"),
                "profile_url": profile_url,
                "stats": {
                    "following": stats_data.get("followingCount"),
                    "followers": stats_data.get("followerCount"),
                    "likes": stats_data.get("heartCount"),
                    "videos": stats_data.get("videoCount")
                }
            }
            logging.info(f"Dados extraídos com sucesso para o usuário: {username}")
            return profile_info

        except (json.JSONDecodeError, KeyError) as e:
            logging.error(f"Erro ao processar o JSON do perfil {username}: {e}")
            return None

    def _generate_username_patterns(self, phone: str) -> list[str]:
        """Gera uma lista de padrões de username a partir de um número de telefone."""
        if len(phone) < 8:
            return []

        last_8 = phone[-8:]
        last_6 = phone[-6:]
        last_4 = phone[-4:]

        patterns = {
            f"user{last_8}", f"user{last_6}", f"user{last_4}",
            f"usuario{last_8}", f"usuario{last_6}", f"usuario{last_4}",
            last_8,
        }
        logging.info(f"Gerados {len(patterns)} padrões de username para o número.")
        return list(patterns)

    def search_by_phone(self, phone_number: str) -> list[dict]:
        """
        Orquestra a busca por perfis a partir de um número de telefone.

        :param phone_number: Número de telefone brasileiro (ex: "11987654321").
        :return: Lista de dicionários, cada um representando um perfil encontrado.
        """
        if not self.driver:
            logging.error("A busca não pode continuar porque o WebDriver não foi inicializado.")
            return []

        clean_phone = re.sub(r'\D', '', phone_number)
        logging.info(f"Iniciando busca para o número de telefone: {phone_number} (limpo: {clean_phone})")

        if not clean_phone:
            logging.error("Número de telefone inválido.")
            return []

        potential_usernames = self._generate_username_patterns(clean_phone)
        found_profiles = []

        for i, username in enumerate(potential_usernames):
            logging.info(f"--- Tentativa {i+1}/{len(potential_usernames)}: testando username '{username}' ---")
            profile_data = self.scrape_profile_data(username)
            if profile_data:
                logging.info(f"SUCESSO! Perfil encontrado e dados extraídos para: {username}")
                found_profiles.append(profile_data)

        logging.info(f"Busca finalizada. Total de perfis encontrados: {len(found_profiles)}")
        return found_profiles

    def close(self):
        """Fecha o WebDriver e encerra a sessão do navegador."""
        if self.driver:
            logging.info("Fechando o WebDriver.")
            self.driver.quit()

# --- Exemplo de Uso ---
if __name__ == "__main__":
    print("--- Ferramenta OSINT para TikTok (com Selenium) ---")
    print("AVISO: Use com responsabilidade e ética.\n")

    tiktok_analyzer = None
    try:
        # Instancia a classe com um delay de 8 segundos.
        tiktok_analyzer = TikTokOSINT(rate_limit_delay_seconds=8)

        # Número de telefone brasileiro para a busca.
        target_phone = "(11) 98765-4321" # SUBSTITUA PELO NÚMERO ALVO

        results = tiktok_analyzer.search_by_phone(target_phone)

        if results:
            print("\n[+] Perfis encontrados associados aos padrões do número:")
            print(json.dumps(results, indent=2, ensure_ascii=False))
        else:
            print("\n[-] Nenhum perfil público foi encontrado para os padrões gerados.")

    except Exception as e:
        logging.error(f"Ocorreu um erro inesperado durante a execução: {e}")
    finally:
        # Garante que o navegador seja fechado mesmo se ocorrer um erro.
        if tiktok_analyzer:
            tiktok_analyzer.close()