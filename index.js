const BLANK_CODE = 0


// ceil object
class CeilSchema {
  ceilNum;
  ceilId;
  row;
  col;
  chosen;
  constructor(randomNumber, row, col) {
    this.ceilNum = Math.ceil(randomNumber / 2)
    this.ceilId = row + "-" + col
    this.row = row
    this.col = col
    this.chosen = false
  }
}





// ceil component of the board ------------------------------------------------
let appCeil = Vue.component('app-ceil', 
{
  props: {
    ceil: CeilSchema
  },
  methods: {
    choose() {
      this.$emit('choose', this.ceil)
    }, 
  },
  template: `
    <div 
      @click = "choose" 
      :class =
      "{
        'app-ceil': true,
        'chosen-ceil': ceil.chosen, 
        'no-opacity': ceil.ceilNum == 0
      }"
    >
    {{ ceil.ceilNum == 0 ? "" : ceil.ceilNum}}
    </div>`
})

// board component ------------------------------------------------
let appBoard = Vue.component('app-board', 
{
  props: ['height', 'width', 'renderedBoard', 'winGame'],
  data() {
    return {
      id: 'app-board',
      chosenCeil: null
    }
  },
  components: {
    appCeil
  },
  mounted() {
    let x = document.getElementById(this.id)
    x.style.display = 'grid'
    x.style.gridTemplateRows = `repeat(${this.height +2}, 40px)`
    x.style.gridTemplateColumns = `repeat(${this.width +2}, 40px)`
  },
  methods: {
    handleChoose(ceil) {
      
      // when no ceil is chosen
      if (this.chosenCeil == null && ceil.ceilNum != BLANK_CODE) {
        this.chosenCeil = ceil
        this.chosenCeil.chosen = true
      } 
      // when 1 ceil is chosen
      else {
        // when ceils match -> delete 2 ceils
        if (
          this.chosenCeil != null && 
          this.chosenCeil.ceilNum == ceil.ceilNum &&
          this.chosenCeil.ceilId != ceil.ceilId
        ) {  
          ceil.ceilNum = BLANK_CODE
          this.chosenCeil.ceilNum = BLANK_CODE
        }

        // finally cancel choosing ceil
        this.chosenCeil.chosen = false
        this.chosenCeil = null
      }
      this.checkWinGame()

    },
    checkWinGame() {
      let check = true
      for (let c of this.renderedBoard) {
        if (c.ceilNum != 0) {
          check = false
          break
        }
      }

      if (check) {
        this.winGame()
      }
    }
  },
  template: `
  <div :id = "this.id">
    <app-ceil 
      @choose = "handleChoose" 
      v-for = "ceil in renderedBoard" 
      :ceil = "ceil" 
      :key = "ceil.ceilId"
    >
    </app-ceil>
  </div>
  `
})

// main app component. Global variables are processed here. ------------------------------------------------
Vue.component('my-app', {
  data() {
    return {
      STOPPED: 0,
      STARTED: 1,
      PAUSED: 2,
      fastestTime: localStorage.getItem("fastestTime"),

      id: "app",
      height: 5,
      width: 8,
      board: [],
      renderedBoard: [],
      currentInterval: null,
      startTime: 0,
      currentTime: null,
      state: 0 // this.stop
    }
  },
  components: {
    appBoard: appBoard
  },
  // created() {
  // },
  methods: {
    loadArray() {
      for (let i=0; i <= this.height+1; i++) {
        let row = []
        for (let j=0; j <= this.width+1; j++) {
          if(i==0 || j==0 || i==this.height+1 || j==this.width+1) // the borders
            row.push(new CeilSchema(BLANK_CODE, i, j))
          else {
            row.push(new CeilSchema(-2, i ,j))
          }
        }
        this.board[i] = row
      }

      let val = this.height * this.width
      for (let n=val; n>=1; n--) {
        let pos = Math.ceil(Math.random() * n)

        boardLoop:
        for (let i=1; i <= this.height; i++) {
          for (let j=1; j <= this.width; j++) {
            if(this.board[i][j].ceilNum < BLANK_CODE) {
              pos -= 1
            }
            if(pos == 0) {
              this.board[i][j] = new CeilSchema(n, i, j)
              break boardLoop
            }
          }
        }
      }
      console.table(this.board)
    },
    renderArray() {
      this.renderedBoard = []
      for (let i=0; i <= this.height+1; i++) {
        for (let j=0; j <= this.width+1; j++) {
          this.renderedBoard.push(this.board[i][j])
        }
      }
    },
    startGame() {
      this.state = this.STARTED
      this.loadArray()
      this.renderArray()

      this.startTime = new Date().getTime()/1000

      this.currentInterval = 
      setInterval(
        function() {
          this.currentTime = parseInt(new Date().getTime()/1000 - this.startTime)
          console.log(this.currentTime)
        }
      .bind(this), 1000)
    },
    stopGame() {
      this.state = this.STOPPED
      clearInterval(this.currentInterval)

      this.board = []
      this.renderedBoard = []
    },
    winGame() {
      this.state = this.STOPPED
      clearInterval(this.currentInterval)

      setTimeout(function() {
        this.fastestTime = this.currentTime
        localStorage.setItem("fastestTime", this.currentTime)
        alert("You won this game in " + this.currentTime + " seconds.")

        this.startTime = 0
        this.currentTime = null
      }.bind(this), 500)
    },
    pauseGame() {},
  },
  template: `
    <div :id="this.id">
			<app-board @matched="renderArray" :winGame="winGame" :height="height" :width="width" :rendered-board="renderedBoard"></app-board>
      <div v-if="state == STARTED">Time: {{ currentTime || 0 }}s </div>
      <button v-if="state == STOPPED" @click.prevent="startGame">Start</button>
      <button v-if="state == STARTED" @click.prevent="stopGame">Stop game</button>
      <button v-if="state == STARTED" @click.prevent="startGame">Play again</button>

      <div>Fastest time: {{fastestTime ? fastestTime + "s" : "Not yet recorded"}} </div>

		</div>
  `
})

// wrapper for the app, 
// because Vue component cant link directly to DOM (03/2021)
new Vue({
  el: '#wrap'
}) 