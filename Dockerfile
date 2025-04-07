# 기본 Node.js 이미지 선택
FROM ubuntu:22.04

# 작업 디렉토리 설정
WORKDIR /app

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y \
    curl \
    ca-certificates \
    lsb-release \
    network-manager && \
    rm -rf /var/lib/apt/lists/*  

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

SHELL ["/bin/bash", "-c"]

# NVM 환경 설정
RUN echo "export NVM_DIR=\"$HOME/.nvm\"" >> ~/.bashrc && \
    echo "[ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\"" >> ~/.bashrc && \
    echo "[ -s \"$NVM_DIR/bash_completion\" ] && . \"$NVM_DIR/bash_completion\"" >> ~/.bashrc

RUN source ~/.nvm/nvm.sh && nvm install --lts && nvm use --lts && npm install -g npm@latest
RUN source ~/.nvm/nvm.sh && node --version && npm install -g @nestjs/cli

# 패키지 파일 복사 및 의존성 설치
COPY package.json package-lock.json ./
RUN source ~/.nvm/nvm.sh && npm install --production

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN source ~/.nvm/nvm.sh && npm run build

# 실행 포트 설정
EXPOSE 11334
EXPOSE 11337

# 컨테이너 실행 명령
CMD ["bash", "-c", "source ~/.nvm/nvm.sh && npm run start:prod"]
