# -*- coding: utf-8 -*-

import requests
import time
import logging
import json
from bs4 import BeautifulSoup
import re

# Configuração do logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class InstagramOSINT:
    """
    Classe para realizar OSINT em perfis do Instagram a partir de números de telefone.
    """
    def __init__(self, rate_limit_delay=2):
        """
        Inicializa o scraper.

        :param rate_limit_delay: Tempo em segundos para esperar entre as requisições.
        """
        self.base_url = "https://www.instagram.com/{}/"
        self.session = requests.Session()
        # User-Agent para simular um navegador comum e evitar bloqueios simples
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        })
        self.rate_limit_delay = rate_limit_delay

    def _gerar_usernames_por_telefone(self, telefone):
        """
        Gera uma lista de usernames potenciais baseados nos últimos 8 e 9 dígitos do número de telefone.
        O número deve estar no formato brasileiro, ex: "5511987654321".

        :param telefone: String com o número de telefone.
        :return: Lista de usernames potenciais.
        """
        # Remove caracteres não numéricos
        numeros = re.sub(r'\D', '', telefone)

        if len(numeros) < 9:
            logging.warning("Número de telefone parece curto demais para gerar usernames válidos.")
            return []

        # Pega os últimos 8 e 9 dígitos
        sufixo_8_digitos = numeros[-8:]
        sufixo_9_digitos = numeros[-9:]

        # Gera uma lista de padrões comuns
        patterns = [
            sufixo_8_digitos,
            sufixo_9_digitos,
            f"eu{sufixo_8_digitos}",
            f"eu{sufixo_9_digitos}",
            f"o{sufixo_8_digitos}",
            f"o{sufixo_9_digitos}",
        ]

        logging.info(f"Gerados {len(patterns)} usernames potenciais para o número terminado em ...{numeros[-4:]}")
        return list(set(patterns)) # Remove duplicatas

    def _validar_perfil(self, username):
        """
        Verifica se um perfil do Instagram existe fazendo uma requisição HTTP.

        :param username: O nome de usuário a ser verificado.
        :return: A resposta da requisição se o perfil existir, caso contrário None.
        """
        url = self.base_url.format(username)
        try:
            logging.info(f"Tentando validar o perfil: {username}")
            response = self.session.get(url, timeout=10)

            # Pausa para evitar bloqueio por excesso de requisições
            time.sleep(self.rate_limit_delay)

            if response.status_code == 200:
                # Verifica se a página não é uma página de "não encontrado" genérica
                if "Page Not Found" not in response.text and "profile-pic" in response.text:
                    logging.info(f"Perfil encontrado: {username}")
                    return response
            else:
                logging.warning(f"Perfil não encontrado ou acesso negado para {username} (Status: {response.status_code})")

        except requests.exceptions.RequestException as e:
            logging.error(f"Erro de rede ao tentar acessar {username}: {e}")

        return None

    def _extrair_dados_do_perfil(self, username, response_content):
        """
        Extrai dados públicos de um perfil do Instagram usando BeautifulSoup.
        Esta função é um exemplo e pode precisar de ajustes conforme o Instagram muda seu HTML.

        :param username: O nome de usuário do perfil.
        :param response_content: O conteúdo HTML da página do perfil.
        :return: Um dicionário com os dados extraídos ou None se não for possível extrair.
        """
        soup = BeautifulSoup(response_content, 'html.parser')

        try:
            # Tenta extrair dados do JSON embutido no script da página (mais confiável)
            script_tag = soup.find('script', type='application/ld+json')
            if script_tag:
                data = json.loads(script_tag.string)

                profile_data = {
                    "username": data.get("alternateName", "").replace("@", ""),
                    "full_name": data.get("name", ""),
                    "biography": data.get("description", ""),
                    "profile_url": f"https://instagram.com/{username}",
                    "is_verified": "isVerified" in data and data["isVerified"],
                }

                # Extrair contagens de seguidores, seguindo e posts (exemplo, pode falhar)
                main_content = data.get("mainEntityofPage", {})
                if "interactionStatistic" in main_content:
                    for item in main_content["interactionStatistic"]:
                        if item.get("interactionType") == "http://schema.org/FollowAction":
                            profile_data["followers_count"] = item.get("userInteractionCount")
                        elif item.get("interactionType") == "http://schema.org/LikeAction": # Exemplo, pode não ser exato
                             profile_data["following_count"] = item.get("userInteractionCount")

                logging.info(f"Dados extraídos com sucesso para {username}")
                return profile_data

        except (json.JSONDecodeError, AttributeError) as e:
            logging.error(f"Não foi possível parsear os dados JSON para {username}: {e}")

        logging.warning(f"Não foi possível extrair dados estruturados para {username}. Pode ser um perfil privado ou o layout mudou.")
        return None

    def buscar_por_telefone(self, telefone):
        """
        Busca perfis do Instagram associados a um número de telefone.

        :param telefone: O número de telefone no formato brasileiro (ex: "5511987654321").
        :return: Uma lista de dicionários, cada um contendo os dados de um perfil encontrado.
        """
        logging.info(f"Iniciando busca para o telefone: {telefone}")
        usernames_potenciais = self._gerar_usernames_por_telefone(telefone)
        perfis_encontrados = []

        if not usernames_potenciais:
            logging.info("Nenhum username potencial gerado. Encerrando a busca.")
            return []

        for username in usernames_potenciais:
            response = self._validar_perfil(username)
            if response:
                dados_perfil = self._extrair_dados_do_perfil(username, response.content)
                if dados_perfil:
                    perfis_encontrados.append(dados_perfil)
                else:
                    # Mesmo que não consiga extrair, o perfil existe.
                    perfis_encontrados.append({"username": username, "status": "Perfil existe, mas dados não puderam ser extraídos."})

        if not perfis_encontrados:
            logging.info("Nenhum perfil público encontrado para os usernames gerados.")

        return perfis_encontrados

if __name__ == '__main__':
    # Exemplo de uso
    # ATENÇÃO: Substitua pelo número de telefone que deseja investigar.
    # O número deve incluir o código do país (55 para o Brasil) e o DDD.
    numero_alvo = "5511999998888"  # Exemplo: DDD 11 (SP)

    print("Iniciando a ferramenta de OSINT para Instagram.")
    print("="*50)

    investigador = InstagramOSINT(rate_limit_delay=3)

    try:
        resultados = investigador.buscar_por_telefone(numero_alvo)

        if resultados:
            print("\n[+] Perfis encontrados:")
            # Imprime os resultados em formato JSON para fácil leitura
            print(json.dumps(resultados, indent=4, ensure_ascii=False))
        else:
            print("\n[-] Nenhum perfil encontrado para o número de telefone fornecido.")

    except Exception as e:
        logging.critical(f"Ocorreu um erro fatal durante a execução: {e}")

    print("\n" + "="*50)
    print("Busca concluída.")