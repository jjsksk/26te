let video;
let handposeModel;
let predictions = [];
let teachers = ["顧大維", "何俐安", "黃琪芳", "林逸農", "徐唯芝", "陳慶帆", "賴婷鈴"];
let nonTeachers = ["馬嘉祺", "丁程鑫", "宋亞軒", "劉耀文", "張真源", "嚴浩翔", "賀峻霖"];
let names = teachers.concat(nonTeachers);
let currentName = "";
let isTeacher = false;
let score = 0;
let lastActionTime = 0;

let feedback = "";
let feedbackTime = 0;
let feedbackY = 0;
let feedbackColor;
let bgFlashColor = null;
let bgFlashStart = 0;

let gameStartTime = 0;
let gameDuration = 60000; // 60秒
let nextNameTime = 0;
let gameActive = false;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(320, 240); // 改成較低解析度
  video.hide();
  loadHandposeModel();
  document.getElementById("startButton").disabled = false;
  document.getElementById("startButton").innerText = "開始遊戲";
  document.getElementById("startButton").onclick = startGame;
}

function loadHandposeModel() {
  handposeModel = ml5.handpose(video, modelReady);
}

function modelReady() {
  console.log("Handpose model loaded!");
  predictHand();
}

function predictHand() {
  handposeModel.predict(video.elt, (err, results) => {
    if (err) {
      console.error(err);
    }
    if (results) {
      predictions = results;
      console.log("results.length:", results.length);
      if (results.length > 0) {
        console.log("偵測到手部", results);
      }
    } else {
      console.log("results 為 null 或 undefined");
    }
    setTimeout(predictHand, 100);
  });
}

function startGame() {
  score = 0;
  feedback = "";
  gameStartTime = millis();
  nextNameTime = millis();
  gameActive = true;
  pickNewName();
  document.getElementById("startButton").disabled = true;
  document.getElementById("startButton").innerText = "遊戲進行中...";
}

function draw() {
  if (bgFlashColor && millis() - bgFlashStart < 150) {
    background(bgFlashColor[0], bgFlashColor[1], bgFlashColor[2], 100);
  } else {
    background(255);
  }

  image(video, 0, 0, width, height);

  // debug log
  console.log(predictions);

  drawHandKeypoints();

  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(currentName, width / 2, 30);

  textSize(20);
  fill(50);
  text("分數: " + score, width - 100, height - 30);

  // 計時器
  if (gameActive) {
    let timeLeft = max(0, gameDuration - (millis() - gameStartTime));
    textAlign(LEFT, CENTER);
    text("剩餘時間: " + Math.ceil(timeLeft / 1000) + " 秒", 20, height - 30);

    // 換題
    if (millis() - nextNameTime > 5000) {
      pickNewName();
      nextNameTime = millis();
      lastActionTime = millis();
    }

    // 判斷動作
    if (predictions.length > 0 && millis() - lastActionTime > 1000) {
      let hand = predictions[0];
      let gesture = detectGesture(hand);
      let correct = false;
      let special = (currentName === "陳慶帆");
      if (isTeacher) {
        if (gesture === "fist") {
          correct = true;
        } else if (gesture === "five") {
          correct = false;
        } else {
          correct = null;
        }
      } else {
        if (gesture === "five") {
          correct = true;
        } else if (gesture === "fist") {
          correct = false;
        } else {
          correct = null;
        }
      }
      if (correct !== null) {
        if (correct) {
          let add = special ? 2 : 1;
          score += add;
          feedback = "+" + add;
          feedbackColor = [0, 180, 0];
          bgFlashColor = [0, 255, 0];
        } else {
          let minus = special ? 3 : 1;
          score -= minus;
          feedback = "-" + minus;
          feedbackColor = [255, 0, 0];
          bgFlashColor = [255, 0, 0];
        }
        feedbackTime = millis();
        feedbackY = height / 2;
        bgFlashStart = millis();
        pickNewName();
        nextNameTime = millis();
        lastActionTime = millis();
      }
    }

    // 遊戲結束
    if (millis() - gameStartTime > gameDuration) {
      gameActive = false;
      document.getElementById("startButton").disabled = false;
      document.getElementById("startButton").innerText = "再玩一次";
      feedback = "遊戲結束！總分：" + score;
      feedbackColor = [0, 0, 200];
      feedbackTime = millis();
      feedbackY = height / 2;
    }
  }

  // 動畫：飛起來的分數提示
  if (millis() - feedbackTime < 1500) {
    if (typeof feedbackColor === 'string' || Array.isArray(feedbackColor)) {
      fill(feedbackColor);
    } else {
      fill(255, 0, 0); // 預設紅色
    }
    textSize(30);
    text(feedback, width / 2, feedbackY);
    feedbackY -= 1;
  }
}

// 畫手部骨架
function drawHandKeypoints() {
  if (predictions.length > 0) {
    let hand = predictions[0];
    let kps = hand.landmarks;
    strokeWeight(4);
    stroke(0, 120, 255);
    // 0~4
    for (let i = 0; i < 4; i++) {
      line(kps[i][0], kps[i][1], kps[i+1][0], kps[i+1][1]);
    }
    // 5~8
    for (let i = 5; i < 8; i++) {
      line(kps[i][0], kps[i][1], kps[i+1][0], kps[i+1][1]);
    }
    // 9~12
    for (let i = 9; i < 12; i++) {
      line(kps[i][0], kps[i][1], kps[i+1][0], kps[i+1][1]);
    }
    // 13~16
    for (let i = 13; i < 16; i++) {
      line(kps[i][0], kps[i][1], kps[i+1][0], kps[i+1][1]);
    }
    // 17~20
    for (let i = 17; i < 20; i++) {
      line(kps[i][0], kps[i][1], kps[i+1][0], kps[i+1][1]);
    }
    // 關鍵點
    for (let i = 0; i < kps.length; i++) {
      fill(0, 255, 0);
      noStroke();
      ellipse(kps[i][0], kps[i][1], 10, 10);
    }
  }
}

// 隨機選名字
function pickNewName() {
  let idx = floor(random(names.length));
  currentName = names[idx];
  isTeacher = teachers.includes(currentName);
}

// 偵測手勢（簡單判斷：五指張開 or 握拳）
function detectGesture(hand) {
  let kps = hand.landmarks;
  // 手掌朝向偵測（簡單判斷：掌心朝鏡頭，0點比9點更靠近鏡頭）
  // 這裡略過，假設玩家都朝向鏡頭

  // 判斷五指是否張開
  // 以每根指尖與掌心距離判斷
  let palm = kps[0];
  let openCount = 0;
  let tipIdx = [4, 8, 12, 16, 20];
  for (let i = 0; i < tipIdx.length; i++) {
    let tip = kps[tipIdx[i]];
    let d = dist(palm[0], palm[1], tip[0], tip[1]);
    if (d > 60) openCount++;
  }
  if (openCount >= 4) return "five";
  if (openCount <= 1) return "fist";
  return "other";
}
