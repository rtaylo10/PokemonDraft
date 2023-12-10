<template>
  <div>
    <div class="content-box">
      <div class="box-title">Settings</div>
      <div class="settingContainer">
        <div>Gen:</div>
        <div class="checkboxList" v-if="!draftStarted">
          <div class="checkboxContainer" v-for="gen in gens" :key="gen">
            {{ gen }}
            <input
              :checked="selectedGen == gen"
              @click="selectGen(gen)"
              type="checkbox"
              name="gen"
            />
          </div>
        </div>
        <div v-else>{{ selectedGen }}</div>
      </div>
      <div class="settingContainer">
        <div># Players:</div>
        <input type="number" v-if="!draftStarted" v-model="numPlayers" style="width: 30px" />
        <div v-else>{{ numPlayers }}</div>
      </div>
      <div class="settingContainer">
        <div>Formats:</div>
        <div v-if="!draftStarted" class="checkboxList">
          <div class="checkboxContainer" v-for="format in formats" :key="format">
            {{ format.name }}
            <input v-model="selectedFormats[format.id]" type="checkbox" name="gen" />
          </div>
        </div>
        <div v-else>
          {{ selectedFormatsText }}
        </div>
      </div>
      <div class="buttonContainer">
        <button @click="startDraft">Start</button>
      </div>
    </div>

    <DraftWindow
      v-if="draftStarted"
      :selectedGen="selectedGen"
      :numPlayers="numPlayers"
      :formatList="selectedFormatsList"
      :formatInfo="loadedFormats"
    />
  </div>
</template>

<script>
import DraftWindow from './DraftWindow.vue'
import BaseApi from '@/api/BaseApi';

export default {
  components: { DraftWindow },

  data() {
    return {
      smogonSetsLink: 'https://pkmn.github.io/smogon/data/sets/',
      smogon: null,
      generationData: null,
      dex: null,

      numGens: 9,
      isLoading: true,
      gens: [],
      selectedGen: 1,
      numPlayers: 2,

      formats: [
        {id: 'zu', name: 'ZU', weight: 1},
        {id: 'pu', name: 'PU', weight: 1},
        {id: 'nu', name: 'NU', weight: 1.5},
        {id: 'ru', name: 'RU', weight: 1.5},
        {id: 'uu', name: 'UU', weight: 0.3},
        {id: 'ou', name: 'OU', weight: 0.1},
        {id: 'ubers', name: 'Ubers', weight: 0.05}
      ],
      selectedFormats: {},
      loadedFormats: {},

      draftStarted: false,
    }
  },

  created() {
    this.setupSettings();
  },

  computed: {
    enabledGensList() {
      let gList = [];
      for(const gen in this.gens) {
        if (this.enabledGens[gen]) {
          gList.push(gen);
        }
      }
      return gList;
    },

    selectedFormatsList() {
      let formatList = [];
      for(let format of this.formats) {
        if (this.selectedFormats[format.id]) {
          formatList.push(format);
        }
      }
      return formatList;
    },

    selectedFormatsText() {
      let returnText = "";
      for(let format of this.selectedFormatsList) {
        if (returnText != "") {
          returnText += ', ';
        }
        returnText += format.name;
      }

      return returnText;
    },

    canStartDraft() {
      let isFormatSelected = this.selectedFormatsList.length > 0;

      return isFormatSelected && !this.draftStarting;
    }
  },

  methods: {
    getFormatString(format) {
      return 'gen' + this.selectedGen + format.id;
    },

    loadFormat(format) {
      let formatString = this.getFormatString(format);
      try {
        BaseApi.get(this.smogonSetsLink + formatString + '.json').then((response) => {
          this.loadedFormats[format.id] = response;
        })
      } catch (e) {
        // Ignore when format isn't found
      }
    },

    async loadFormats() {
      this.loadedFormats = {};
      for(let format of this.selectedFormatsList) {
        this.loadFormat(format);
      }
    },

    setupSettings() {
      for (let i = 1; i <= this.numGens; i++) {
        this.gens.push(i);
        this.selectedGen = i;
      }

      for(let format of this.formats) {
        this.selectedFormats[format.id] = true;
      }

      this.numPlayers = 2;
    },

    selectGen(gen) {
      this.selectedGen = gen;
    },

    startDraft() {
      if (!this.canStartDraft) {
        return;
      }

      this.draftStarting = true;

      this.loadFormats().then(() => {
        this.draftStarted = true;
        this.draftStarting = false;
      });
    },
  },
}
</script>

<style lang="scss" scoped>
.settingsBox {
}
.settingContainer {
  display: flex;
  align-items: center;
  gap: 10px;
}
.checkboxList {
  display: flex;
  align-items: center;
  gap: 10px;
}

.buttonContainer {
  padding-top: 10px;
  padding-bottom: 5px;
}
</style>
