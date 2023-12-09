<template>
  <div class="content-box" v-if="started">
    <div class="playerReadyBox" v-if="!playerIsReady">
      <div>Player {{ curPlayerTurn }} Ready</div>
      <button @click.stop="startPicking">Choose</button>
    </div>
    <!-- <button @click="generateNewPokemon">Generate</button> -->
    <div v-else class="pokemonList">
      <div
        class="pokeContainer"
        v-for="(name, index) in remainingNames[curPlayerTurn]"
        :key="index"
        @click="pickPokemon(name)"
      >
        <template v-if="!name">
          <img class="pokeImg emptyImg" src="@/assets/masterball.png" :key="name" />
          <div class="infoBox">Wildcard</div>
        </template>
        <img class="pokeImg" :src="pokemonImage(name)" :key="name" />
        <div class="infoBox">
          <div class="pokeName">
            {{ name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    started: { type: Boolean, default: false },
    selectedGen: { type: Number, default: null },
    formatInfo: { type: Object, default: null },
    formatList: { type: Array, default: null }
  },
  data() {
    return {
      pokemonInfoApi: 'https://pokeapi.co/api/v2/pokemon/',
      shinyOdds: 8192,

      generatedNames: {},
      remainingNames: {},
      pokemonData: {},

      allPokemonList: [],

      numPokemonToGenerate: 6,
      picksPerList: 3,

      maxRounds: 6,
      curRound: 0,
      numPlayers: 2,
      curPlayerTurn: 1,
      playerIsReady: false,

      playerTeamPicks: {},

      showingResults: false
    }
  },

  created() {
    this.setupPlayerData()
    this.fetchAllPokemonList()
  },

  computed: {
    allPokemonNames() {
      let newList = []
      for (let poke of this.allPokemonList) {
        newList.push(poke.name)
      }

      return newList
    },

    allPokemonMap() {
      let newMap = {}
      for (let poke of this.allPokemonList) {
        newMap[poke.name] = poke.url
      }

      return newMap
    },

    pokemonNamesByFormat() {
      let newMap = {}
      for (let format of this.formatList) {
        let info = this.formatInfo[format.id]
        let pokemonNames = Object.keys(info)
        newMap[format.id] = pokemonNames
      }

      return newMap
    }
  },

  methods: {
    setupPlayerData() {
      for (let i = 1; i <= this.numPlayers; ++i) {
        this.playerTeamPicks[i] = []
        this.generatedNames[i] = []
        this.remainingNames[i] = []
      }
    },

    fetchAllPokemonList() {
      fetch(this.pokemonInfoApi + '?limit=100000&offset=0', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }).then((serverPromise) => {
        serverPromise.json().then((response) => {
          this.allPokemonList = response.results
        })
      })
    },

    fetchPokemonList(pokeList) {
      for (const pokemonName of pokeList) {
        this.fetchPokemonData(pokemonName)
      }
    },

    fetchPokemonData(name) {
      if (name == null) {
        return
      }
      fetch(this.pokemonInfoApi + name, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }).then((serverPromise) => {
        serverPromise.json().then((response) => {
          this.pokemonData[name] = response
        })
      })
    },

    getFormatString(format) {
      return 'gen' + this.selectedGen + format.id
    },

    pokemonImage(name) {
      if (!this.pokemonData[name]) {
        return ''
      }
      let pokemonInfo = this.pokemonData[name]
      let isShiny = Math.floor(Math.random() * this.shinyOdds) == 0
      let nameModifiers = 'front'
      if (isShiny) {
        nameModifiers += '_shiny'
      } else {
        nameModifiers += '_default'
      }
      return pokemonInfo.sprites[nameModifiers]
    },

    getRandPoke(pokeList, excludeList) {
      console.log(pokeList)
      console.log(excludeList)
      let searchList = pokeList.slice().filter((p) => !excludeList[p])
      let listLen = searchList.length
      let randIndex = Math.floor(Math.random() * listLen)

      return searchList[randIndex]
    },

    getRandPokeFromFormat(fId, excludeList) {
      let pokeList = this.pokemonNamesByFormat[fId]
      return this.getRandPoke(pokeList, excludeList)
    },

    findPokeName(name) {
      let newName = name.toLowerCase()
      newName = newName.replace("'", '')
      if (this.allPokemonMap[newName]) {
        return newName
      }

      for (let n of this.allPokemonNames) {
        if (n.search(newName) > -1 || newName.search(n) > -1) {
          return n
        }
      }

      return null
    },

    generateAllNewPokemon() {
      for (let i = 1; i <= this.numPlayers; ++i) {
        this.generateNewPokemon(i)
      }
    },

    generateNewPokemon(playerNum) {
      let highestFormat = null
      let generatedList = []
      let excludedPokes = {}
      for (let format of this.formatList) {
        let formatWeight = Math.random() * format.weight
        let formatInfo = { weight: formatWeight, format: format }
        if (!highestFormat) {
          highestFormat = formatInfo
        } else if (highestFormat.weight < formatWeight) {
          highestFormat = formatInfo
        }

        let fId = highestFormat.format.id
        let pokeName = this.getRandPokeFromFormat(fId, excludedPokes)

        pokeName = this.findPokeName(pokeName)

        generatedList.push(pokeName)
        excludedPokes[pokeName] = true
      }

      this.generatedNames[playerNum] = generatedList
      this.remainingNames[playerNum] = generatedList
      this.fetchPokemonList(this.generatedNames[playerNum])
    },

    startPicking() {
      let genNames = this.generatedNames[this.curPlayerTurn]
      let remNames = this.remainingNames[this.curPlayerTurn]
      if (
        !genNames.length ||
        genNames.length - remNames.length >= this.picksPerList
      ) {
        this.curRound++
        if (this.curRound == this.maxRounds * this.numPlayers) {
          this.showResults()
        } else {
          this.generateNewPokemon(this.curPlayerTurn)
          this.curRound++
        }
      }

      this.playerIsReady = true
    },

    rotateLists() {
      let firstRem = this.remainingNames[1].slice();
      let firstGen = this.generatedNames[1].slice();
      for(let i = 2; i <= this.numPlayers; ++i) {
        this.remainingNames[i - 1] = this.remainingNames[i].slice();
        this.generatedNames[i - 1] = this.generatedNames[i].slice();
      }

      this.remainingNames[this.numPlayers] = firstRem;
      this.generatedNames[this.numPlayers] = firstGen;
    },

    nextTurn() {
      this.playerIsReady = false
      let turn = this.curPlayerTurn + 1
      if (turn > this.numPlayers) {
        turn = 1
        this.rotateLists()
      }
      this.curPlayerTurn = turn
    },

    pickPokemon(name) {
      let list = this.playerTeamPicks[this.curPlayerTurn].slice()
      list.push(name)
      console.log(this.curPlayerTurn)
      this.playerTeamPicks[this.curPlayerTurn] = list
      this.remainingNames[this.curPlayerTurn] = this.remainingNames[this.curPlayerTurn].filter((n) => n != name)

      this.nextTurn()
    }
  }
}
</script>

<style lang="scss">
.content-box {
  margin-top: 10px;
}

.playerReadyBox {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.pokemonList {
  display: flex;
}

.pokeContainer {
  border-radius: 5px;
  cursor: pointer;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    background: var(--color-background-soft) !important;
  }
}

.pokeImg {
  height: 100px;
}

.infoBox {
  text-align: center;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 2px solid var(--color-border);
}
</style>
