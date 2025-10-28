# Ferramenta OSINT para WhatsApp

Este projeto contém um script Python para realizar OSINT (Open Source Intelligence) em números de telefone do WhatsApp. Ele utiliza o Selenium para automatizar o WhatsApp Web e extrair informações de perfil publicamente disponíveis associadas a um número de telefone brasileiro.

**AVISO IMPORTANTE:** Esta ferramenta foi desenvolvida para fins educacionais e de pesquisa em segurança. A utilização desta ferramenta para atividades maliciosas, spam ou qualquer forma de assédio é estritamente proibida. O uso indevido do WhatsApp pode violar seus termos de serviço e resultar no bloqueio da sua conta. Use com responsabilidade e ética.

## Funcionalidades

-   **Automação com Selenium:** Controla um navegador Chrome para interagir com o WhatsApp Web. **O script opera com um navegador visível para evitar a detecção por parte do WhatsApp.**
-   **Validação de Conta:** Verifica se um número de telefone possui uma conta ativa no WhatsApp usando métodos de verificação atualizados.
-   **Extração de Dados:** Coleta nome, recado (status) e URL da foto do perfil usando seletores de CSS estáveis.
-   **Rate Limiting:** Inclui pausas para simular um comportamento mais humano e minimizar o risco de bloqueio.
-   **Logging Detalhado:** Registra todas as ações e erros em um arquivo `whatsapp_osint.log`.
-   **Saída Estruturada:** Retorna as informações coletadas em formato JSON.
-   **Persistência de Sessão:** Salva a sessão do navegador para evitar a necessidade de escanear o QR code a cada execução.

## Requisitos

-   Python 3.7+
-   **Google Chrome instalado e acessível no PATH do sistema.**

## Instalação

1.  **Clone o repositório ou baixe os arquivos.**

2.  **Navegue até o diretório do projeto:**
    ```bash
    cd whatsapp_osint
    ```

3.  **Crie um ambiente virtual (recomendado):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # No Windows, use `venv\Scripts\activate`
    ```

4.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

## Como Usar

1.  **Execute o script pela primeira vez:**

    Na primeira execução, o script **abrirá uma nova janela do Google Chrome** e exibirá a página do WhatsApp Web com um QR code. Você precisará escaneá-lo com o aplicativo do WhatsApp no seu celular para fazer login.

    ```bash
    python whatsapp_osint.py <numero_de_telefone>
    ```

    -   Substitua `<numero_de_telefone>` pelo número que você deseja pesquisar.
    -   **Use o formato brasileiro completo, apenas com dígitos.** Exemplo: `5511999999999`.

2.  **Autenticação:**

    -   Após escanear o QR code, sua sessão ficará salva em uma pasta chamada `user-data-dir`. Nas próximas execuções, o login será automático, desde que a sessão não expire.
    -   Aguarde a mensagem "Login realizado com sucesso!" no console. O script prosseguirá automaticamente após o login.

3.  **Execuções subsequentes:**

    Execute o mesmo comando. O script irá carregar a sessão salva e proceder diretamente para a busca do número.

    ```bash
    python whatsapp_osint.py 5521987654321
    ```

## Exemplo de Saída

Se a conta for encontrada, a saída será um JSON semelhante a este:

```json
{
    "numero_pesquisado": "5521987654321",
    "conta_existente": true,
    "dados_perfil": {
        "nome": "Nome do Usuário",
        "recado": "Disponível",
        "url_foto_perfil": "blob:https://web.whatsapp.com/..."
    },
    "erro": null
}
```

Se a conta não existir, a saída será:

```json
{
    "numero_pesquisado": "5511000000000",
    "conta_existente": false,
    "dados_perfil": null,
    "erro": "Número de telefone inválido ou não cadastrado no WhatsApp."
}
```

## Estrutura do Projeto

-   `whatsapp_osint.py`: O script principal com toda a lógica.
-   `requirements.txt`: As dependências Python do projeto.
-   `README.md`: Este arquivo de instruções.
-   `.gitignore`: Arquivo para ignorar logs e dados de sessão do Git.
-   `whatsapp_osint.log`: Arquivo de log gerado durante a execução (ignorado pelo Git).
-   `user-data-dir/`: Pasta criada para armazenar a sessão do Chrome (ignorada pelo Git).