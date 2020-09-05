# 봉사의 숲

### 봉사의 숲이란
블록체인을 활용하여 봉사활동 내역을 관리하는 웹 서비스  
블록체인 - Hyperledger Fabric 사용  
백엔드 - Node.js  

## Hyperledger Fabric
Private BlockChain 오픈소스 [참고 문서](https://hyperledger-fabric.readthedocs.io/en/release-2.2/)  
> Fabric 네트워크 구축 - https://github.com/inomp3042/fov 에서 구축해야 동작함

#### 네트워크, 채널 join
Fabric 네트워크를 만들고 네트워크 안에 채널을 생성하고 해당 채널에 봉사 확인 서버, 봉사 기관 서버를 등록해야함 

#### Chaincode
봉사 확인 서버, 봉사 기관 서버에서 블록체인에 query, invoke 하기 위한 코드 [참고](https://hyperledger.github.io/fabric-chaincode-node/release-2.2/api/)

## 백엔드
#### 패브릭 SDK
백엔드에서 패브릭과 상호작용 하기위한 SDK [참고](https://hyperledger.github.io/fabric-sdk-node/release-2.2/module-fabric-network.html)

#### 메인 서버 (localhost:3000)
해당 프로젝트에서 쉽게 con1, vol1 서버로 이동하기 위한 웹 제공하는 서버  

#### vol1 서버 (localhost:3001)
봉사 기관 서버로 봉사 기관 마다 구축된 서버로 가정함 (봉사 기관을 입력하기 위해 구축)  
봉사활동 입력 -> Hyperledger Fabric Chaincode를 실행하여 트랜잭션 발생 -> Orderer 서버로 트랜잭션 전달  

#### con1 서버 (localhost:3002)
봉사 내역을 확인 할 수 있는 서버, 봉사 활동 인증을 쉽게 가능하도록 하는 서버  
봉사활동 내역 확인 -> Hyperledger Fabric Chaincode를 실행 -> 블록체인에 저장된 데이터를 가져옴  

#### 메인 서버, vol1 서버(봉사 기관 서버), con1 서버(봉사 확인 서버) 모두 시작
```
npm stat
```

