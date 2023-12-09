<template>
  <div class="pokemonList">
    <div
      v-for="(name, index) in pkmnList"
      class="pokeContainer"
      :class="{canClick: canPick, duplicate: hasDuplicate(name)}"
      :key="index"
      @click="pickPokemon(name)"
    >
      <template v-if="!name">
        <img class="pokeImg emptyImg" src="@/assets/masterball.png" :key="name" />
        <div class="infoBox">Wildcard</div>
      </template>
      <template v-else>
      <img class="pokeImg" :src="pokemonImage(name)" :key="name" />
        <div class="infoBox">
          <div class="pokeName">
            {{ name }}{{ hasDuplicate(name) ? ' (dup)' : '' }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pkmnList: { type: Array, default: null },
    currentPicks: {type: Array, default: null},
    pokemonData: { type: Object, default: null},
    canPick: {type: Boolean, default: false},
  },

  data() {
    return {
      shinyOdds: 8192,
    }
  },

  computed: {
    pickedMap() {
      let newMap = {};
      for(let p of this.currentPicks) {
        newMap[p] = true;
      }

      return newMap;
    }
  },

  methods: {
    pickPokemon(name) {
      if (this.canPick) {
        this.$emit('pick', name);
      }
    },

    hasDuplicate(name) {
      console.log(this.pickedMap)
      return this.pickedMap[name] != null && this.canPick;
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
  }
}
</script>

<style lang="scss" scoped>

.pokemonList {
  display: flex;
}

.pokeContainer {
  border-radius: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.canClick {
    cursor: pointer;

    &:hover {
      background: var(--color-background-soft);
    }
  }

  &.duplicate {
    filter: opacity(0.5);
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