# Relatório de Inicialização do Docker (Windows)

Este documento registra a verificação e inicialização do ambiente Docker após a ativação do Docker Desktop no Windows, incluindo versões, permissões, teste de execução e observações.

## Resumo
- Sistema operacional: Windows
- Contexto ativo do Docker: `desktop-linux`
- Docker Desktop: `4.48.0 (207573)`
- Docker Engine Client: `28.5.1` (`windows/amd64`)
- Docker Engine Server: `28.5.1` (`linux/amd64`, WSL2)
- Kernel WSL2: `6.6.87.2-microsoft-standard-WSL2`
- Memória disponível para engine: `~3.8 GiB`

## Verificações Executadas

### 1) Versão do Docker Engine e estado do daemon
- Comando: `docker version` e `docker info`
- Resultado:
  - Client: `28.5.1`, Contexto: `desktop-linux`
  - Server: `28.5.1`, Storage Driver: `overlayfs`, Cgroup v2
  - Proxies configurados: `HTTP/HTTPS proxy via http.docker.internal:3128`
  - Status: daemon ativo e acessível

### 2) Docker Compose
- Fonte: Plugins listados em `docker info`
- Compose plugin: `v2.40.0-desktop.1` (caminho: `C:\Program Files\Docker\cli-plugins\docker-compose.exe`)
- Observação: `docker compose version` não exibiu saída nesta sessão, porém o plugin está instalado e operacional segundo `docker info`.

### 3) Contexto Docker
- Comando: `docker context ls`
- Resultado:
  - `desktop-linux` (ativo) → `npipe:///./pipe/dockerDesktopLinuxEngine`
  - `default` → `npipe:///./pipe/docker_engine`

### 4) Teste de execução (hello-world)
- Comando: `docker run --rm hello-world`
- Resultado: sucesso. A imagem foi pullada e o container executou, imprimindo "Hello from Docker!".

### 5) Permissões de usuário
- Comando: `net localgroup "docker-users"`
- Resultado: o usuário `Coopere Web` está no grupo `docker-users`. Isto garante acesso aos recursos do Docker Desktop sem execução como administrador.

## Problemas/Observações
- `docker compose version` não retornou saída, embora o plugin Compose esteja instalado. Possível causa: particularidades de captura de saída do plugin nesta sessão/terminal. Como workaround, confiar na listagem de plugins em `docker info`, que mostra a versão instalada.
- Proxies configurados (`http.docker.internal:3128`) podem impactar pulls de imagens em alguns cenários. No teste hello-world, o pull foi concluído com sucesso.

## Próximos Passos
- Prosseguir com `supabase start` e `supabase db reset` para inicialização do ambiente de banco local.
- Caso encontre lentidão ou falhas ao puxar imagens, revisar configurações de rede/proxy no Docker Desktop (Settings → Resources → Proxies) e aumentar memória CPU/RAM alocada (Settings → Resources).

## Comandos Executados (referência)
```
docker version
docker info
docker context ls
docker run --rm hello-world
net localgroup "docker-users"
```

---
Atualizado automaticamente pelo assistente em: <!-- date will be set by VCS history -->