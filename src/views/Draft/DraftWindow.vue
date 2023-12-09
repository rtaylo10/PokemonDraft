<template>
  <div class="content-box" v-if="started">
    <button @click="generateNewPokemon">Generate</button>
    <div v-if="generatedNames.length > 0">
      <div v-for="(name, index) in generatedNames" :key="index">
        <img :src="pokemonImage(name)" :key="name" />
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  props: {
    started: {type: Boolean, default: false},
    selectedGen: {type: Number, default: null},
    formatInfo: {type: Object, default: null},
    formatList: {type: Array, default: null},
  },
  data() {
    return {
      pokemonInfoApi: 'https://pokeapi.co/api/v2/pokemon/',
      shinyOdds: 8192,

      generatedNames: [],
      pokemonData: {},

      allPokemonList: [],

      numPokemonToGenerate: 6,
    }
  },

  created() {
    this.fetchAllPokemonList();
  },

  computed: {
    allPokemonNames() {
      let newList = [];
      for(let poke of this.allPokemonList) {
        newList.push(poke.name);
      }

      return newList
    },

    allPokemonMap() {
      let newMap = {};
      for(let poke of this.allPokemonList) {
        newMap[poke.name] = poke.url; 
      }

      return newMap;
    },

    pokemonNamesByFormat() {
      let newMap = {};
      for(let format of this.formatList) {
        console.log(format);
        let info = this.formatInfo[format.id];
        let pokemonNames = Object.keys(info);
        newMap[format.id] = pokemonNames
      }

      return newMap;
    }
  },

  methods: {
    fetchAllPokemonList() {
      fetch(this.pokemonInfoApi + '?limit=100000&offset=0', {headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }}).then(serverPromise => {
        serverPromise.json().then(response => {
          this.allPokemonList = response.results;
        })
      })
    },

    fetchPokemonList(pokeList) {
      for(const pokemonName of pokeList) {
        this.fetchPokemonData(pokemonName)
      }
    },

    fetchPokemonData(name) {
      fetch(this.pokemonInfoApi + name, {headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }}).then(serverPromise => {
        serverPromise.json().then(response => {
          this.pokemonData[name] = response;
        })
      })
    },

    getFormatString(format) {
      return 'gen' + this.selectedGen + format.id;
    },

    pokemonImage(name) {
      if (!this.pokemonData[name]) {
        return "";
      }
      let pokemonInfo = this.pokemonData[name];
      let isShiny = Math.floor(Math.random() * this.shinyOdds) == 0;
      let nameModifiers = "front";
      if (isShiny) {
        nameModifiers += '_shiny';
      } else {
        nameModifiers += '_default';
      }
      return pokemonInfo.sprites[nameModifiers];
    },

    getRandPoke(pokeList, excludeList) {
      console.log(pokeList);
      let searchList = pokeList.slice().filter(p => !excludeList[p])
      let listLen = searchList.length;
      let randIndex = Math.floor(Math.random() * listLen);

      return searchList[randIndex];
    },

    getRandPokeFromFormat(fId, excludeList) {
      let pokeList = this.pokemonNamesByFormat[fId];
      return this.getRandPoke(pokeList, excludeList);
    },

    findPokeName(name) {
      let newName = name.toLowerCase();
      newName = newName.replace('\'', '');
      if (this.allPokemonMap[newName]) {
        return newName
      }

      for(let n of this.allPokemonNames) {
        if (n.search(newName) > -1 || newName.search(n) > -1) {
          return n;
        }
      }
      
      return 'missingno'
    },

    generateNewPokemon() {
      let highestFormat = null;
      let generatedList = [];
      let excludedPokes = {};
      console.log(this.formatList);
      for(let format of this.formatList) {
        let formatWeight = Math.random() * format.weight;
        let formatInfo = { weight: formatWeight, format: format };
        if (!highestFormat) {
          highestFormat = formatInfo;
        } else if (highestFormat.weight < formatWeight) {
          highestFormat = formatInfo;
        }

        let fId = highestFormat.format.id;
        let pokeName = this.getRandPokeFromFormat(fId, excludedPokes);

        pokeName = this.findPokeName(pokeName);

        generatedList.push(pokeName);
      }

      this.generatedNames = generatedList;
      this.fetchPokemonList(this.generatedNames);
    }
  }
}
</script>

<style lang="scss">
  .content-box {
    margin-top: 10px;
  }
</style>