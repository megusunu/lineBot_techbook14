//============================================================
// めぐすぬBOT メッセージReply処理
//============================================================

// めぐすぬ（LINE BOT）のアクセストークン
const ACCESS_TOKEN     = '<チャンネルアクセストークン>'
const REPLY_ENDPOINT   = 'https://api.line.me/v2/bot/message/reply'
const GROUP_ENDPINT    = 'https://api.line.me/v2/bot/group/'
const ROOM_ENDPINT     = 'https://api.line.me/v2/bot/room/'
const PROFILE_ENDPOINT = 'https://api.line.me/v2/bot/profile/'
const BOT_NAME         = 'めぐすぬ'

/**
 * LINEからPOSTリクエストとしてメッセージを受信したときの実行処理
 * 
 * @param {*} event LINEからの送信イベント
 * @returns 
 */
function doPost(event) {
  console.log("Start: event: %s", JSON.stringify(event))

  // Botに送付されたメッセージの解析
  const eventJson = JSON.parse(event.postData.contents)
    // 送信イベント元に応答するためのトークン。
  const replyToken = eventJson.events[0].replyToken
    // 受け取ったメッセージ
  const sentMessage = eventJson.events[0].message.text
    // 送信元のtypeを取得する。typeは、user、group、roomのいづれか
  const sourceType = eventJson.events[0].source.type
    // 送信元のuserIdを取得する
  const userId = eventJson.events[0].source.userId

  //---------------------------------------------------------
  // 応答メッセージを定義する
  //---------------------------------------------------------
  let replyMessage = ""
  // 返答するランダムメッセージ定義
  const randomMessages = [
    { text: "わくわく$", 
      emojis: [{index: 4, productId: "5ac21184040ab15980c9b43a", emojiId: "013"}] },
    { text: "わー$楽しみにしている$$",
      emojis: [{index: 2, productId: "5ac21184040ab15980c9b43a", emojiId: "020"},
               {index:11, productId: "5ac21184040ab15980c9b43a", emojiId: "016"},
               {index:12, productId: "5ac21184040ab15980c9b43a", emojiId: "016"}] }
  ]

  //---------------------------------------------------------
  // 後処理を定義する
  //---------------------------------------------------------
  let finalProcesses = ''

  //---------------------------------------------------------
  // 特定のメッセージを含む場合の処理
  //---------------------------------------------------------
  const patterns_1 = ["機能追加"]
  const patterns_2 = ["機能を", "追加"]
  const patterns_3 = [BOT_NAME, "どっかいけ"]
  if (includeAllPatterns(sentMessage, patterns_1) ||
    includeAllPatterns(sentMessage, patterns_2)) {
	//-----------------------------------------------------
    // "機能追加"のメッセージの時、ランダムメッセージを応答する
	//-----------------------------------------------------
    // ランダムメッセージから1つ選ぶ
    replyMessage = randomMessages[Math.floor(Math.random() * (randomMessages.length))]

  } else if (includeAllPatterns(sentMessage, patterns_3)) {
	//-----------------------------------------------------
    // 退出のメッセージの時、ルームから退出する
	//-----------------------------------------------------
	const userName = getDisplayname(userId)

    replyMessage = {
	  text: userName + 'なんてきらいやーーー$$$',
      emojis: [{index: userName.length +10, productId: "5ac21184040ab15980c9b43a", emojiId: "014"},
               {index: userName.length +11, productId: "5ac21184040ab15980c9b43a", emojiId: "014"},
               {index: userName.length +12, productId: "5ac21184040ab15980c9b43a", emojiId: "014"}]
	}

    console.log("sourceType: %s", sourceType)
    switch (sourceType)
    {
      case 'group':
      // グループからの退出
        finalProcesses = function(){
          leaveGroup(eventJson.events[0].source.groupId)
        }
        break
        
      case 'room':
        // ルームからの退出
        finalProcesses = function(){
          leaveRoom(eventJson.events[0].source.roomId)
        }
        break
        
      default:
        // それ以外は何もしない
        break
	  }
  }

  //---------------------------------------------------------
  // 応答メッセージを送信する
  //---------------------------------------------------------
  // 応答しなくていい場合は、returnする
  if ( !replyMessage ) {
    return
  }
  // リクエストヘッダー
  const headers = {
    'Content-Type'  : 'application/json; charset=UTF-8',
    'Authorization' : 'Bearer ' + ACCESS_TOKEN
  }

  // リクエストボディ
  const payload = {
    "replyToken" : replyToken,
    "messages" : [{
      "type" : "text",
      "text" : replyMessage["text"],
      "emojis" : replyMessage["emojis"]
    }]
  }

  // 応答メッセージを設定する
  const params = {
    "headers" : headers,
    "method"  : "post",
    "payload" : JSON.stringify(payload),
    "muteHttpExceptions": true
  }

  // 応答メッセージを送る
  console.log("replyMessage: %s", JSON.stringify(params))
  const ret = UrlFetchApp.fetch(REPLY_ENDPOINT, params)
  console.log("Return: %s", ret)    

  //---------------------------------------------------------
  // 後処理（最後に実行したい処理）があれば実行する
  //---------------------------------------------------------
  if (finalProcesses != '') {
    console.log("finalProcesses:", )    
    const final = finalProcesses()
    console.log("finalProcesses: final: %s", final)    
  }
}

/**
 * sorceに文字列（正規表現も可）リストをすべて含むかの確認
 * 
 * @param {string} source チェック対象の文字列
 * @param {string[]} patterns チェックする文字列（正規表現も可）のリスト。
 * @returns {boolean} sourceにpatternsすべてを含む場合、trueを返す
 */
function includeAllPatterns(source, patterns) {
  let ret = true // 返値デフォルト

  for ( let i = 0; i < patterns.length; i++ ) {
    if (source.search(patterns[i]) === -1) {
      // 一致しないパターンがあったので、終了する
      ret = false
      break
    }
  }
  return ret
}

/**
 * グループからの退出
 * 
 * @param {string} groupId グループID
 */
function leaveGroup(groupId) {
  // グループから退出するAPIのURL
  const url = GROUP_ENDPINT + groupId + '/leave'
  
  // リクエストヘッダー
  const headers = {
    'Authorization' : 'Bearer ' + ACCESS_TOKEN
  }
    
  // 送信メッセージの内容
  const params = {
    'headers' : headers,
	'method' : 'post'
  }
  
  // メッセージを送信
  const ret = UrlFetchApp.fetch(url, params)
  console.log("leaveGroup:Return: %s", ret)    

}

/**
 * ルームからの退出
 * 
 * @param {string} roomId ルームID
 */
function leaveRoom(roomId) {
  // グループから退出するAPIのURL
  const url = ROOM_ENDPINT + roomId + '/leave'
  
  // リクエストヘッダー
  const headers = {
    'Authorization' : 'Bearer ' + ACCESS_TOKEN
  }
    
  // 送信メッセージの内容
  const params = {
    'headers' : headers,
    'method' : 'post'
  }
  
  // メッセージを送信
  const ret = UrlFetchApp.fetch(url, params)
  console.log("leaveRoom:Return: %s", ret)    
}

/**
 * ユーザー名（displayname）を取得する
 * @param {*} roomId 
 * @returns {string} ユーザ名
 */
function getDisplayname(userId) {
  // プロファイルを取得するAPIのURL
  const url = PROFILE_ENDPOINT + userId

  // リクエストヘッダー
  const headers = {
    'Authorization' : 'Bearer ' + ACCESS_TOKEN
  }

  // 送信メッセージの内容
  const params = {
    'headers' : headers,
    'method' : 'GET'
  }

  // メッセージを送信
  const content = UrlFetchApp.fetch(url, params).getContentText()

  return JSON.parse(content).displayName
}