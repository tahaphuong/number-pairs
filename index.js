const BLANK_CODE = 0
class CeilSchema {
  ceilNum;
  ceilId;
  row;
  col;
  chosen;
  constructor(randomNumber, row, col) {
    let code = Math.ceil(randomNumber / 2)
    this.ceilNum = code
    this.ceilId = row + "-" + col
    this.row = row
    this.col = col
    this.chosen = false
  }
}

let appCeil = Vue.component('app-ceil', {
  props: {
    ceil: CeilSchema
  },
  methods: {
    choose: function() {
      this.$emit('choose', this.ceil)
    }, 
    updated: function() {
      console.log('ceil updated')
    }
  },
  template: `<div @click="choose" class="app-ceil" :class="{'chosen-ceil': ceil.chosen, 'no-opacity': this.ceil.ceilNum == 0}">
  {{this.ceil.ceilNum == 0 ? "" : this.ceil.ceilNum}}</div>`
})


let appBoard = Vue.component('app-board', {
  props: ['height', 'width', 'renderedBoard'],
  data: function() {
    return {
      id: 'app-board',
      choosing: null
    }
  },
  components: {
    appCeil: appCeil
  },
  mounted: function() {
    let x = document.getElementById(this.id)
    x.style.display = 'grid'
    x.style.gridTemplateRows = `repeat(${this.height +2}, 40px)`
    x.style.gridTemplateColumns = `repeat(${this.width +2}, 40px)`
  },
  updated: function() {
    // console.log('this board updated', this.board)
  },
  methods: {
    handleChoose: function(ceil) {
      if (ceil.ceilNum == BLANK_CODE) {
        if (this.choosing != null) {
          this.handleCancelChoose()
        }
      } else if (this.choosing == null) {
        ceil.chosen = true
        this.choosing = ceil
      } else if (this.choosing.ceilId == ceil.ceilId) {
        this.handleCancelChoose()
      } else {
        if (this.choosing.ceilNum == ceil.ceilNum) {
          ceil.chosen = true
          this.choosing.ceilNum = 0
          ceil.ceilNum = 0
        }
        this.handleCancelChoose()
      }
    },
    handleCancelChoose: function() {
      this.choosing.chosen = false
      this.choosing = null
    }
  },
  template: `
  <div :id="this.id">
    <app-ceil v-on:choose="handleChoose" v-for="ceil in renderedBoard" :ceil="ceil" :key="ceil.ceilId"></app-ceil>
  </div>
  `
})
// <app-ceil v-on:choose="handleChoose" v-for="ceil in row" :ceil="ceil">12</app-ceil>
Vue.component('my-app', {
  data: function() {
    return {
      id: "app",
      height: 5,
      width: 8,
      board: [],
      renderedBoard: []
    }
  },
  components: {
    appBoard: appBoard
  },
  created: function() {
  },
  methods: {
    loadArray: function() {
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
    renderArray: function() {
      this.renderedBoard = []
      for (let i=0; i <= this.height+1; i++) {
        for (let j=0; j <= this.width+1; j++) {
          this.renderedBoard.push(this.board[i][j])
        }
      }
    },
  },
  template: `
    <div :id="this.id">
			<app-board v-on:matched="renderArray" :height="height" :width="width" :rendered-board="renderedBoard"></app-board>
			<button v-on:click.prevent="loadArray(); renderArray();">click me</button>
		</div>
  `
})

new Vue({
  el: '#wrap'
}) 