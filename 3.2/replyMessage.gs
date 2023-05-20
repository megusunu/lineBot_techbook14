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
    { text: "わくわく$", 
      emojis: [{index: 4, productId: "5ac21184040ab15980c9b43a", emojiId: "013"}] },
    { text: "わー$楽しみにしている$$",
      emojis: [{index: 2, productId: "5ac21184040ab15980c9b43a", emojiId: "020"},
               {index:11, productId: "5ac21184040ab15980c9b43a", emojiId: "016"},
               {index:12, productId: "5ac21184040ab15980c9b43a", emojiId: "016"}] }
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
 * doPostテストコード
 */
function test_doPost() {

  // contents情報
  const contents = {
    destination: "xxxxxxxxxx",
	  events:[{
	    type: "message",
	    message: {
        type: "text",
        id: "14353798921116",
        text: "機能を追加します"
	    },
	    webhookEventId: "00000000000000000000000000",
	    deliveryContext: {
	      isRedelivery:false
	    },
	    timestamp: 1684280263058,
	    source:{
        type: "user",
        userId: "U80696558e1aa831..."
	    },
      replyToken: "dbfd37306dcd4e9694bc18df2f509c0e",
	    mode:"active"
	  }]
  }
  
  // event情報
  const event = {
	  queryString: "",
	  parameters: {},
	  contentLength: 402,
	  postData: {
	    contents : JSON.stringify(contents),  //Json文字列にする
	    length:402,
	    name:"postData",
	    type: "application/json"
	  },
	  contextPath :"",
	  parameter :{}
  }

  doPost(event)
}
