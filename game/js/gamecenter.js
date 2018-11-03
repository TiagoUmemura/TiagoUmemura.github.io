//Luan
class Coord extends Phaser.Sprite {
    constructor(id, game) {
        super(game, 0, 0, '')
        this.data = {
            x: 170,
            y: 240
        }
        if (id != '') ServerComm.loadState(id, (response) => this.updateLastCheckpointReached(response))
    }
    updateLastCheckpointReached(json) {
        let newCoords = json['data']
        if (newCoords['x'] != null) {
            this.data.x = newCoords['x']
            this.data.y = newCoords['y']
        }
    }
    updateCoord(id, x, y) {
        this.data.x = x
        this.data.y = y
        if (id != '') ServerComm.saveState(id, this.data, (response) => this.responseServer(response))
    }
    responseServer(response) {
        if (response['response'] != 'ok') {
            console.log("ERRO de comunicao com o servidor")
            return
        }
    }
}
class Trophy extends Phaser.Sprite {
    constructor(id, game) {
        super(game, 0, 0, '')
        this.data = {}
        this.data['first death'] = {
            name: 'first death',
            xp: 10,
            title: 'KEEP CALM AND PLAY',
            description: 'First death on game'
        }
        this.data['ghost death'] = {
            name: 'ghost death',
            xp: 15,
            title: 'KEEP CALM AND RUN AWAY',
            description: 'First death to a ghost'
        }
        this.data['gem apprentice'] = {
            name: 'gem apprentice',
            xp: 20,
            title: 'GOTTA FIND THOSE GEMS',
            description: 'Get 20 gems'
        }
        this.data['checkpoint'] = {
            name: 'checkpoint',
            xp: 200,
            title: 'KEEP CALM AND SAVE!!',
            description: 'Get to a ckeckpoint'
        }
        this.data['gem master'] = {
            name: 'gem master',
            xp: 20,
            title: 'GOTTA FIND THOSE GEMS',
            description: 'Get ALL the gems'
        }
        this.panels = [] // fila de paineis de trofeus
        this.achieved = [] // lista dos nomes do trofeus jah conquistados
        //ServerComm.clearTrophy((r) => console.log( JSON.stringify(r) ) ) 
        // listar os trofeus no servidor e atualizar this.achieved
        if (id != '') {
            console.log("I am here")
            ServerComm.listTrophy(id, (response) => this.updateAchievedTrophies(response))
            $('#name-profile-modal').hide()
        }
    }
    updateAchievedTrophies(json) {
        // coloca os nomes dos trofeus na lista de controle: this.achieved
        let list = json['data']
        for (let t of list) {
            this.achieved.push(t['name'])
            this.addTrophyOnPage(t['name'])
        }
    }
    createPanel(trophyName) {
        let panelY = this.game.height - 74 - this.panels.length * 74
        let panel = this.game.add.sprite(this.game.width - 250, panelY, 'trophy')
        panel.fixedToCamera = true
        //panel.alpha = 0
        let labelX = 66
        let labelWidth = panel.width - labelX
        let style = {
            font: '10px Arial',
            fill: '#ffffff',
            wordWrap: true,
            wordWrapWidth: labelWidth
        }
        let label = this.game.add.text(labelX, 5, '', style)
        label.lineSpacing = -7
        panel.addChild(label)
        // define label
        label.text = this.data[trophyName].title + '   +'
        label.text += this.data[trophyName].xp + '\n\n'
        label.text += this.data[trophyName].description
        return panel
    }
    show(id, trophyName) {
        if (this.achieved.includes(trophyName)) return
        if (id != '') ServerComm.addTrophy(id, this.data[trophyName], (response) => this.onServerResponse(response, trophyName))
    }
    onServerResponse(response, trophyName) {
        if (response['response'] != 'ok') {
            console.log("ERRO de comunicao com o servidor")
            return
        }
        this.achieved.push(trophyName)
        let panel = this.createPanel(trophyName)
        this.panels.push(panel)
        // agenda a destruicao do panel
        this.game.time.events.add(Phaser.Timer.SECOND * 3, this.removePanel, this)
        this.addTrophyOnPage(trophyName)
    }
    addTrophyOnPage(trophyName) {
        $('#trophies-list-empty-label').hide()
        let html = Templates.trophiesListItem(this.data[trophyName])
        $('#div-trophy').append(html)
    }
    removePanel() {
        let p = this.panels.shift()
        p.destroy()
    }
}
class Templates {}
Templates.trophiesListItem = Handlebars.compile($('#template-trophies-list-item').html())
Templates.profileItem = Handlebars.compile($('#template-profile-item').html())
class ServerComm {
    static addProfile(id, data, callback) {
        ServerComm.sendRequestProfile(id, 'add-profile', data, callback)
    }
    static addTrophy(id, data, callback) {
        ServerComm.sendRequestTrophy(id, 'add-trophy', data, callback)
    }
    static listTrophy(id, callback) {
        ServerComm.sendRequestTrophy(id, 'list-trophy', '', callback)
    }
    static clearTrophy(callback) {
        ServerComm.sendRequestTrophy('john_doe', 'clear-trophy', '', callback)
    }
    static saveState(id, data, callback) {
        ServerComm.sendRequestCoord(id, 'save-state', data, callback)
    }
    static loadState(id, callback) {
        ServerComm.sendRequestCoord(id, 'load-state', "", callback)
    }
    static sendRequestCoord(user, opName, opData, callback) {
        let data = {
            id: user,
            op: opName,
            data: opData
        }
        ServerComm.ajaxPost(data, callback)
    }
    static sendRequestTrophy(user, opName, opData, callback) {
        let data = {
            id: user,
            op: opName,
            data: opData
        }
        ServerComm.ajaxPost(data, callback)
    }
    static sendRequestProfile(user, opName, opData, callback) {
        let data = {
            id: user,
            op: opName,
            data: opData
        }
        ServerComm.ajaxPost(data, callback)
    }
    static ajaxPost(data, callback) {
        let url = 'http://localhost:8000/game/profile'
        $.post(url, JSON.stringify(data)).done(function(data, status) {
            let jsonObj = JSON.parse(JSON.stringify(data))
            callback(jsonObj)
        }).fail(function(jqXHR, status, errorThrown) {
            console.log('ERROR: cannot reach game server')
        })
    }
}