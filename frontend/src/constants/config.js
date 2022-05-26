const config = {
    "BSC": {
        currency: 'BNB',
        rpc: "https://data-seed-prebsc-2-s3.binance.org:8545/",
        "targetChainId" : '0x61',
        "chainId":'97',
        "targetChainName" : "bsctestnet",
    },
    "POLYGON": {
        currency: "MATIC",
        rpc: "https://matic-mumbai.chainstacklabs.com",
        "targetChainId" : '0x13881',
        "chainId":'80001',
        "targetChainName" : "Polygon Testnet",
    },
    "AVALANCHE": {
        currency: 'AVAX',
        rpc: "https://api.avax-test.network/ext/bc/C/rpc",
        "targetChainId" : '0xA869',
        "chainId":'43113',
        "targetChainName" : "Avalanche Testnet",
    }
}

export default config;