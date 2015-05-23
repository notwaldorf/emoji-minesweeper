var Game = function (x, y, bomb_n, emojiset, twemoji){
  this.cell_n = x*y
  if (this.cell_n > 500) { alert("too big, go away"); return false }
  this.twemoji = twemoji || false
  this.emojiset = emojiset
  this.map = document.getElementById("map")
  this.map.innerHTML = ""
  this.x = x
  this.y = y
  this.bomb_n = bomb_n
  this.rate = bomb_n/this.cell_n
  this.numbermoji = [this.emojiset[0], "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"]

  this.init()
}

Game.prototype.init = function () {
  var that = this
  this.bomb_arr().forEach(function (a, i) {
    var mine = that.mine(a)
    var x_cord = Math.floor((i+1)%that.x) || that.x
    var y_cord = Math.ceil((i+1)/that.x)
    mine.classList.add("x"+ x_cord, "y" + y_cord)
    mine.neightbors = [(".x" + x_cord + ".y" + (y_cord + 1)), (".x" + x_cord + ".y" + (y_cord - 1)),
                       (".x" + (x_cord + 1) + ".y" + (y_cord + 1)), (".x" + (x_cord + 1) + ".y" + (y_cord - 1)), (".x" + (x_cord + 1) + ".y" + y_cord),
                       (".x" + (x_cord - 1) + ".y" + (y_cord + 1)), (".x" + (x_cord - 1) + ".y" + (y_cord - 1)), (".x" + (x_cord - 1) + ".y" + y_cord)]

    that.map.appendChild(mine)
    if (x_cord === that.x) that.map.appendChild(document.createElement("br"))
  })

  var cells = document.querySelectorAll(".cell")
  for(var i=0; i < cells.length; i++) {
    var obj = cells[i]
    if (obj.isBomb) { continue }
    var count = 0
    Array.prototype.forEach.call(document.querySelectorAll(obj.neightbors), function (n) {
      if (n.isBomb) count ++
    })
    if (count === 0) obj.isSpace = true
    obj.mine_count = count
  }

  if (this.twemoji) this.prepareTwemoji()
  this.bindEvents()
}

Game.prototype.bindEvents = function () {
  var that = this
  var cells = document.getElementsByClassName("cell")
  Array.prototype.forEach.call(cells, function (target){
    target.addEventListener("click", function() {
      if (!target.isMasked || target.isFlagged) return false
      target.reveal()
      target.isMasked = false
      target.classList.add("unmasked")
      if (target.isSpace) {
        var neightbors = Array.prototype.filter.call(document.querySelectorAll(target.neightbors), function (neightbor) { return neightbor.isMasked })
        Array.prototype.forEach.call(neightbors, function triggerfriends (n) { setTimeout(function () {n.click()}, 5) } )
      }
      that.game()
    })

    target.addEventListener("contextmenu", function (evt) {
      if (target.isFlagged) {
        target.innerHTML = that.twemoji ? twemoji.parse(that.emojiset[3]) : that.emojiset[3]
        target.isFlagged = false
      } else {
        target.innerHTML = that.twemoji ? twemoji.parse(that.emojiset[2]) : that.emojiset[2]
        target.isFlagged = true
      }
      evt.preventDefault()
    })
  })
}

Game.prototype.game = function () {
  if (this.result) return false
  var cells = document.getElementsByClassName("cell")
  var masked = Array.prototype.filter.call(cells, function (cell) {
    return cell.isMasked
  })
  var bombs = Array.prototype.filter.call(cells, function (cell) {
    return cell.isBomb && !cell.isMasked
  })

  if (bombs.length > 0) {
    Array.prototype.forEach.call(masked, function(cell) { cell.reveal(); cell.classList.add("unmasked") })
    this.result = "lost"
    alert("you lost")
  } else if (masked.length === this.bomb_n) {
    Array.prototype.forEach.call(masked, function(cell) { cell.reveal(); cell.classList.add("unmasked") })
    this.result = "won"
    alert("you won")
  }
}

Game.prototype.mine = function (bomb) {
  var that = this
  var base = document.createElement("span")
  base.className = "cell"
  base.innerHTML = this.twemoji ? twemoji.parse(this.emojiset[3]) : this.emojiset[3]
  base.isMasked = true
  if (bomb) base.isBomb = true
  base.reveal = function () {
    var emoji = this.isBomb ? that.emojiset[1] : that.numbermoji[this.mine_count]
    this.innerHTML = that.twemoji ? twemoji.parse(emoji) : emoji
  }
  return base
}

Game.prototype.prepareTwemoji = function () {
  this.emojiset.concat(this.numbermoji).forEach(function(emoji) {
    var image = new Image()
    image.src = twemoji.parse(emoji).match(/src=\"(.+)\">/)[1]
  })
}

Game.prototype.bomb_arr = function () {
  var chance = this.rate * this.cell_n
  var arr = []
  for(var i=0; i < chance; i++) {
    arr.push(true)
  }
  for(var n=0; n < (this.cell_n - chance); n++) {
    arr.push(false)
  }
  return this.shuffle(arr)
}

Game.prototype.shuffle = function (array) {
  var currentIndex = array.length, temporaryValue, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

// console documentation

console.log("Use: `new Game(cols, rows, bombs, [emptyemoji, bombemoji, flagemoji, starteremoji], twemojiOrNot)` to start a new game with customizations.")
console.log(' Eg: `new Game(10, 10, 10, ["🌱", "💥", "🚩", "◻️"], false)`')
console.log(' Or: `new Game(16, 16, 30, ["🐣", "💣", "🚧", "◻️"], true)`')