// Initialize Firebase
var config = {
  apiKey: "AIzaSyAvDytLceLdvanRcJou3bEJupgATgdT32c",
  authDomain: "felipeantunes-app.firebaseapp.com",
  databaseURL: "https://felipeantunes-app.firebaseio.com",
  projectId: "felipeantunes-app",
  storageBucket: "felipeantunes-app.appspot.com",
  messagingSenderId: "362921158755"
};
firebase.initializeApp(config);


let r = g = b = 255 //braco é a cor padrão

let ledCharacteristic = null
let dispositivoBluetooth
const SERVICO_PRIMARIO_UUID = '0000ffb0-0000-1000-8000-00805f9b34fb'
const CARACTERISTICA_ESCRITA_UUID = '0000ffb2-0000-1000-8000-00805f9b34fb'
let conectado = false

let btConectar = document.querySelector('#bt-conectar')
let btDesconectar = document.querySelector('#bt-desconectar')

btConectar.addEventListener("click", conectar)
btDesconectar.addEventListener("click", desconectar)

let corLampada = document.querySelector('#corLampada')

function conectar(){

    if(!conectado){
        //console.log('Solicitando conecão com dispositivo bluetooth...')
        navigator.bluetooth.requestDevice(
            {
                filters: [{ services: [SERVICO_PRIMARIO_UUID] }]
            })
            .then(device => {
                dispositivoBluetooth = device
                //console.log('> dispositivo encontrado ' + device.name)
                //console.log('Conectando ao servidor GATT...')
                return device.gatt.connect()
            })
            .then(server => {
                //console.log('Obtendo o serviço 0xffb2 - Controle da lampada...')
                return server.getPrimaryService(SERVICO_PRIMARIO_UUID)
            })
            .then(service => {
                //console.log('Obtendo a caracteristica 0xffe9 - Controle da lampada...')
                return service.getCharacteristic(CARACTERISTICA_ESCRITA_UUID)
            })
            .then(characteristic => {
                //console.log('Caracteristica encontrada!')
                ledCharacteristic = characteristic
                console.log('Dispositivo conectado')
                conectado = true
                setCor(255,255,255)
                btConectar.classList.add('esconder')
                btDesconectar.classList.remove('esconder')
                imgSeletorCor.classList.remove('esconder')

            })
            .catch(error => {
                console.log('Argh! ' + error)
            })
    }

}

function desconectar(){
    if (!dispositivoBluetooth) {
       return;
     }
     if (dispositivoBluetooth.gatt.connected) {
        conectado = false
        corLampada.style.fill = '#000'
        setCor(0,0,0)
        dispositivoBluetooth.gatt.disconnect()

        console.log('Dispositivo desconectado')

        btDesconectar.classList.add('esconder')
        btConectar.classList.remove('esconder')

     }
}

firebase.database().ref('clientes').on('value', snapshot => {
    let batimentos = snapshot.pop();
    if (batimentos >= 95){
      corLampada.style.fill = '#ff0000';
      setCor(255,0,0);
    } else {
      corLampada.style.fill = '#00ff00';
      setCor(0,255,0);
    }

});



function rgb2Hex(r,g,b) {
    return toHex(r)+toHex(g)+toHex(b)
}
function toHex(n) {
    n = parseInt(n,10);
    if (isNaN(n)){
        return "00"
    }
    n = Math.max(0,Math.min(n,255))
    return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16)
}

function setCor(vermelho, verde, azul) {
        let data = new Uint8Array([azul, verde, vermelho, toHex(255)])
        return ledCharacteristic.writeValue(data)
            .catch(err => console.log('Erro ao escrever o valor na caracteristica! ', err))
}
