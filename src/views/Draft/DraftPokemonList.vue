<template>
  <div class="pokemonList">
    <div
      class="pokeContainer"
      :class="{canClick: canPick}"
      v-for="(name, index) in pkmnList"
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
            {{ name }}
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
    pokemonData: { type: Object, default: null},
    canPick: {type: Boolean, default: false},
  },

  data() {
    return {
      shinyOdds: 8192,
    }
  },

  methods: {
    pickPokemon(name) {
      if (this.canPick) {
        this.$emit('pick', name);
      }
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