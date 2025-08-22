# ✅ Versão 1 – TransOptima

## Funcionalidades Implementadas

1. **CRUD de Transportadoras**  
   - Criar, listar, editar e remover transportadoras.  
   - Campos principais: razão social, CNPJ, UF, químicos controlados (sim/não).  

2. **Cadastro de Tipos de Documento**  
   - Definição dos documentos obrigatórios.  
   - Regras diferenciadas para transportadoras com **químicos controlados** e **não controlados**.  

3. **Gestão de Documentos**  
   - Upload de documentos (com datas de emissão e vencimento).  
   - Listagem de documentos por transportadora.  
   - Identificação automática do status: **Válido, A vencer, Expirado**.  

4. **Disponibilidade para Frete**  
   - Campo `disponivelParaFrete` atualizado automaticamente.  
   - Critério: apenas **transportadoras com todos os documentos obrigatórios válidos** ficam disponíveis.  

5. **Listagem de Disponibilidade**  
   - Endpoint/tela que mostra transportadoras **disponíveis** e **indisponíveis**.  
   - Filtros por **UF** e **tipo de produto** (controlado/não controlado).  

6. **Seeds e Usuário Mock**  
   - Base de teste populada com transportadoras e documentos (válidos, a vencer e vencidos).  
   - Usuário mockado para proteger rotas de criação/edição.  

7. **Infraestrutura Docker**  
   - Banco **PostgreSQL** e aplicação rodando via `docker-compose`.  
   - Arquivo `.env` configurável para credenciais e parâmetros de execução.  

## Endpoints Principais

- `POST /transportadoras` → criar transportadora  
- `GET /transportadoras` → listar transportadoras  
- `PUT /transportadoras/{id}` → atualizar transportadora  
- `DELETE /transportadoras/{id}` → remover transportadora  
- `POST /transportadoras/{id}/documentos` → upload de documento  
- `GET /transportadoras/{id}/documentos` → listar documentos da transportadora  
- `GET /disponibilidade?uf=SC&produto=quimico` → listar disponíveis e indisponíveis  

---

## Status da Versão 1
- ✔ CRUD de transportadoras  
- ✔ Upload e controle de documentos  
- ✔ Regras de obrigatoriedade aplicadas  
- ✔ Cálculo automático de disponibilidade  
- ✔ Listagem com filtros por UF e produto  
- ✔ Docker configurado com PostgreSQL  
- ✔ Seeds de dados para teste  

