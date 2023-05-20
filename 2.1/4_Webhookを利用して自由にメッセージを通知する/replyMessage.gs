//============================================================
// めぐすぬBOT メッセージReply処理
//============================================================

// めぐすぬ（LINE BOT）のアクセストークン
const ACCESS_TOKEN = '<チャンネルアクセストークン>'
const REPLY_ENDPOINT= 'https://api.line.me/v2/bot/message/reply'

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

  //---------------------------------------------------------
  // 応答メッセージを定義する
  //---------------------------------------------------------
  let replyMessage = ""
  // 返答するランダムメッセージ定義
  const randomMessages = [
    { text: "わくわく" },
    { text: "わー楽しみにしている" }
  ]

  //---------------------------------------------------------
  // "機能追加"のメッセージを含む場合、ランダムメッセージを返す
  //---------------------------------------------------------
  const patterns_1 = ["機能追加"]
  const patterns_2 = ["機能を", "追加"]
  if (includeAllPatterns(sentMessage, patterns_1) ||
    includeAllPatterns(sentMessage, patterns_2)) {

    // ランダムメッセージから1つ選ぶ
    replyMessage = randomMessages[Math.floor(Math.random() * (randomMessages.length))]
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
      "text" : replyMessage["text"]
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