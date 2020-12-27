<h1 align="center">Mastercard Access</h1>

<p align="center">
    <img src="https://nodei.co/npm/mastercard-access.png?downloads=true&downloadRank=true&stars=true"/>
</p>

<p align="center">
<img src="https://badgen.net/npm/v/mastercard-access"/>
<img src="https://badgen.net/npm/dt/mastercard-access"/>
<img src="https://badgen.net/npm/license/mastercard-access"/>
<img src="https://badgen.net/npm/types/mastercard-access"/>
<img src="https://badgen.net/badge/author/MurylloEx/red?icon=label"/>
</p>

Essa simples e prática biblioteca realiza a autenticação em sua conta Mastercard Acesso e enfim provê uma camada de APIs para emitir um boleto para você.

## Que problema ela resolve?

O objetivo dessa biblioteca é proporcionar a você a possibilidade de emitir boletos utilizando sua conta Mastercard Acesso (https://www.meuacesso.com.br/).

## Exemplo de uso

Para utilizar a biblioteca, apenas importe o módulo principal e então instancie a classe Mastercard com as suas credenciais de acesso (CPF e senha). 

```javascript
var Mastercard = require('mastercard-access');

(async () => {
  var mastercardApi = new Mastercard('56422670605', 'sua_senha_aqui');

  mastercardApi.on('connecting', () => {
    console.log('Connecting...');
  });

  mastercardApi.on('authenticated', async () => {
    console.log('Authenticated.');
    //Você pode encontrar esse token "legacy" fazendo a inspeção das requisições http na página do MeuAcesso.
    //Procure por um token passado na string de consulta na requisição de boletos.
    //Emita um boleto no navegador e veja o desencadeamento de requisições, você encontrará uma nesse estilo:
    //https://www.meuacesso.com.br/api-conta/v1/bankslip/legacy/52516440095406341690601024997161
    let boletoData = await mastercardApi.createBoleto(100, '52516440095406341690601024997161');
    console.log(boletoData);
  });

  mastercardApi.on('unauthorized', () => {
    console.log('Wrong credentials.');
  });

  mastercardApi.on('confirmation', async () => {
    console.log('Pending confirmation...');
    if (await mastercardApi.confirmCode('776234') == true) {
      console.log('Device confirmated with success.');
    } else {
      console.log('Error while confirmating the device.');
    }
  });
})();
```

O retorno da variável boletoData é um JSON semelhante ao seguinte:

```json
{
  "link":"https://www.acessocard.com.br/BoletoConsulta/Boleto.aspx?guidBoleto={03CD32DA-ABDF-40A0-B1A8-F2B5465D6E5F}&imprime=1&numBoleto=62421634",
  "barCode":"32191.08344 43164.110918 00028.850302 1 84520000010290",
  "amount":102.9,
  "owingDate":"2020-11-27T23:44:57.7523063-03:00",
  "returnCrypto":"9hPiEuyMJ2K+2to9vhMA/SMJIA1o7MKTzTtPkKe7ImL/FoiRdqvGnrUdI/3lxt9JY/bU14u72FlihrLVFO6QvBvL55Aiwm8l2LZ5oai3Cgcdw+Xg0ynueUO2aCv8jWsyl54fiQgaQ9X9T2cypfNFktsHe46H7eAAtvWYcLkAXduJlSLUCseOFTJ0TrUU/MKV1/sreW3MkUgzHn5ln4Ybdgp55ePSWnoh8kYodj/yxCzuWUXmet5nq+bJ3JpKWelyKcE/Wp9ptbtC41SEkxD3Wg=="
}
```

A imagem do boleto será semelhante a seguinte, provavelmente emitida pelo ITAÚ:

<p align="center">
  <img src="https://i.imgur.com/yvmbzD1.png"/>
</p>
