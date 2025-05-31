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

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  loadHandposeModel();
  pickNewName();
  document.getElementById("startButton").disabled = false;
document.getElementById("startButton").innerText = "開始遊戲";
}

async function loadHandposeModel() {
  handposeModel = await handpose.load();
  predictHand();
}

function predictHand() {
  handposeModel.estimateHands(video.elt).then((results) => {
    predictions = results;
    setTimeout(predictHand, 100);
  });
}

function draw() {
  if (bgFlashColor && millis() - bgFlashStart < 150) {
    background(bgFlashColor[0], bgFlashColor[1], bgFlashColor[2], 100);
  } else {
    background(255);
  }

  image(video, 0, 0, width, height);
  drawHandKeypoints();

  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(currentName, width / 2, 30);

  textSize(20);
  fill(50);
  text("分數: " + score, width - 100, height - 30);

  // 動畫：飛起來的分數提示
  if (millis() - feedbackTime < 1500) {
    fill(feedbackColor);
    textSize(30);
    text(feedback, width / 2, feedbackY);
    feedbackY -= 1;
  }

  if (millis() - lastActionTime > 2000 && predictions.length > 0) {
    let hand = predictions[0];
    let isClosed = isHandClosed(hand);
    isTeacher = teachers.includes(currentName);
    let isSpecial = currentName === "陳慶帆";

    let correct = false;

    if (isSpecial) {
      if (isClosed) {
        score += 2;
        feedback = "+2分（答對了）";
        feedbackColor = color(0, 180, 0);
        bgFlashColor = [0, 255, 0];
      } else {
        score -= 3;
        feedback = "-3分（答錯了）";
        feedbackColor = color(255, 0, 0);
        bgFlashColor = [255, 0, 0];
      }
    } else if ((isTeacher && isClosed) || (!isTeacher && !isClosed)) {
      score += 1;
      feedback = "+1分（答對了）";
      feedbackColor = color(0, 180, 0);
      bgFlashColor = [0, 255, 0];
    } else {
      score -= 1;
      feedback = "-1分（答錯了）";
      feedbackColor = color(255, 0, 0);
      bgFlashColor = [255, 0, 0];
    }

    feedbackTime = millis();
    feedbackY = height - 60;
    bgFlashStart = millis();
    lastActionTime = millis();
    pickNewName();
  }
}

function isHandClosed(hand) {
  let fingerTips = [8, 12, 16, 20];
  let closedCount = 0;

  for (let i = 0; i < fingerTips.length; i++) {
    let tip = hand.landmarks[fingerTips[i]];
    let joint = hand.landmarks[fingerTips[i] - 2];
    let d = dist(tip[0], tip[1], joint[0], joint[1]);
    if (d < 30) closedCount++;
  }

  return closedCount >= 3;
}

function pickNewName() {
  currentName = random(names);
}

function drawHandKeypoints() {
  if (predictions.length > 0) {
    let hand = predictions[0];
    for (let i = 0; i < hand.landmarks.length; i++) {
      let [x, y] = hand.landmarks[i];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 10, 10);
    }

    stroke(0, 255, 0);
    strokeWeight(2);
    for (let finger of hand.annotations) {
      for (let i = 0; i < finger.length - 1; i++) {
        let [x1, y1] = finger[i];
        let [x2, y2] = finger[i + 1];
        line(x1, y1, x2, y2);
      }
    }
  }
}
