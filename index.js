const puppeteer = require('puppeteer');
const { EventEmitter } = require('events');
const axios = require('axios').default;

class Mastercard extends EventEmitter {

  constructor(cpf, pass) {
    super();
    (async () => {
      this.browser = await puppeteer.launch({ headless: true });
      const page = (await this.browser.pages())[0];
      this.webpage = page;
      this.emit('connecting');
      await page.goto('https://www.meuacesso.com.br/Conta/', {
        referer: 'https://www.meuacesso.com.br/'
      });
      await page.type('#CustomerCode', cpf, { delay: 250 });
      await page.type('#Password', pass, { delay: 250 });
      await page.click("button[type='submit']");
      await page.waitForNavigation();
      if ((page.url()).toUpperCase().includes('ACCOUNT/LOGIN')){
        //Credenciais inválidas.
        this.emit('unauthorized');
      }
      else if ((page.url()).toUpperCase().includes('ACCOUNT/SENDDEVICETOKEN')){
        //Confirmação de email necessária.
        this.emit('confirmation');
      }
      else if ((page.url()).toUpperCase().includes('CONTA')){
        //Autenticação bem sucedida.
        setTimeout(() => { this.emit('authenticated'); }, 2000);
      }
    })();
  }

  async confirmCode(code){
    if (String(code).length != 6)
      return false;
    for (let idx = 0; idx < String(code).length; idx++){
      await this.webpage.type(`#Token_${idx}_`, code[idx], { delay: 150 });
    }
    await this.webpage.waitForNavigation();
    if (await this.webpage.$('#EMAIL') !== null){
      return false;
    }
    await this.webpage.click('.btn-primary');
    await this.webpage.waitForSelector('#Name');
    await this.webpage.type('#Name', 'COMPUTER', { delay: 250 });
    await this.webpage.click('.btn-primary');
    await this.webpage.waitForNavigation();
    setTimeout(() => {
      this.emit('authenticated');
    }, 2000);
    return true;
  }

  async getAccessToken(){
    return await this.webpage.evaluate(async () => {
      let authStr = sessionStorage.getItem('authentication') || null;
      if (authStr !== null){
        let accessTk = JSON.parse(authStr).access_token;
        this.accessToken = accessTk;
        return accessTk;
      } else {
        if (!this.accessToken)
          return false;
        return this.accessToken;
      }
    });
  }

  async createBoleto(amount, legacyTk){
    return new Promise(async (resolve, _reject) => {
      axios.post('https://www.meuacesso.com.br/api-conta/v1/bankslip/legacy/' + legacyTk, 
        {
          requestedAmount: Number(amount)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.113 Safari/537.36',
            'Authorization': 'Bearer ' + await this.getAccessToken()
          }
        }
      ).then((value) => {
        resolve(value.data);
      }).catch((reason) => {
        if (reason.response) {
          resolve(reason.response.data);
        } else {
          resolve({});
        }
      });
    });

  }

  async close(){
    await this.browser.close();
  }

}

module.exports = Mastercard;