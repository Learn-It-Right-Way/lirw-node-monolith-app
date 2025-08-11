# Node js monolith application
Base Node.js monolith application built with Express.js, created primarily for the ECS video series to demonstrate various Amazon ECS features. Each branch corresponds to a specific ECS feature covered in the series, allowing step-by-step exploration alongside the videos.

## User Interface
![Home](./public/ss/home.png)

## Prerequisites 
1. Install [HomeBrew](https://brew.sh/)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install [Colima](https://formulae.brew.sh/formula/colima)
```bash
brew install colima
```

3. Install [Docker](https://formulae.brew.sh/formula/docker)
```bash
brew install docker
```

4. Install [Docker Compose](https://formulae.brew.sh/formula/docker-compose)
```bash
brew install docker-compose
```

5. Starts Colima using Docker as the runtime
```bash
colima start --runtime docker
```

6. Install [AWS CLI V2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions)
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
```
```bash
sudo installer -pkg ./AWSCLIV2.pkg -target /
```
```bash
which aws
```
```bash
aws --version
```