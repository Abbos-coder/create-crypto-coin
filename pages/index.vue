<template>
  <div id="anime-bg">
    <img src="@/assets/image/logo-1.png" alt="logo" class="bg-logo" />
    <nav class="navbar">
      <div class="navbar__body">
        <div class="navbar__logo">Myc<span>Generator</span></div>
        <div class="navbar__btn">
          <a href="#" id="enableMetamask">Connect</a>
        </div>
      </div>
    </nav>
    <v-container>
      <h1 text-center class="my-5 mt-2 white--text text-center">
        BEP20 Token Generator
      </h1>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col class="mt-5 white--text" cols="12" sm="12">
            <v-select
              :items="items"
              label="Token Type"
              v-model="typeToken"
              @change="block2"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              label="Token Name"
              :rules="rules"
              hide-details="auto"
              placeholder="Ex: Myteamcoin"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mt-5">
            <v-text-field
              label="Symbol"
              :rules="symbol"
              hide-details="auto"
              placeholder="Ex: MYC"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mt-5">
            <v-text-field
              label="Decimals"
              type="number"
              :rules="decimals"
              hide-details="auto"
              placeholder="Ex: 18"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mt-5">
            <v-text-field
              label="Total Supply"
              type="number"
              hide-details="auto"
              placeholder="Ex: 100000000"
              v-model="totalSupple"
              :rules="[(v) => !!v || 'total supply is required']"
              required
            ></v-text-field>
          </v-col>
        </v-row>

        <section v-if="show" class="block2 mt-5">
          <v-row>
            <v-col class="mt-5 white--text" cols="12" sm="12">
              <v-select
                :items="router"
                label="Router"
                v-model="routerSelect"
                dense
                required
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <v-text-field
                disabled
                label="Reward Token"
                hide-details="auto"
                placeholder="0xc99a0aD9Fb77E74Dda20AC805223B760Ad3bDfd5"
                v-model="reward"
                hint="MyTeamCoin(MYC) token"
                :rules="[(v) => !!v || 'reward token is required']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" sm="12">
              <v-text-field
                label="Minimum token balance for dividends"
                type="number"
                hide-details="auto"
                placeholder="Ex: 100000000"
                :rules="[
                  (v) =>
                    !!v || 'minimum token balance for dividends is required',
                ]"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <v-text-field
                label="Token Reward Fee(%)"
                type="number"
                hide-details="auto"
                placeholder="0 - 10"
                :rules="[(v) => !!v || 'token reward fee is required']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" sm="12">
              <v-text-field
                label="Auto add liquidity fee(%)"
                type="number"
                hide-details="auto"
                placeholder="0 - 100"
                :rules="[(v) => !!v || 'auto add liquidity fee is required']"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <v-text-field
                label="Marketing fee(%)"
                type="number"
                hide-details="auto"
                placeholder="0 - 10"
                :rules="[(v) => !!v || 'marketing fee is required']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" sm="12">
              <v-text-field
                label="Marketing wallet(%)"
                hide-details="auto"
                placeholder="0x..."
                :rules="[(v) => !!v || 'marketing wallet is required']"
              ></v-text-field>
            </v-col>
          </v-row>
        </section>
        <v-btn
          :loading="loading3"
          :disabled="loading3"
          id="create"
          class="mt-5 mb-15 white--text"
          @click="validate(), (loader = 'loading3')"
        >
          Create
          <v-icon right dark> mdi-cloud-upload </v-icon>
        </v-btn>
      </v-form>
      <div v-for="file in files" :key="file._id" class="files">
        <img :src="file.productImg.path" alt="my image" />
      </div>
      {{ files[0].productImg.path }}
      <img :src="files[0].productImg.path" alt="img" />
    </v-container>
  </div>
</template>
<script>
export default {
  async asyncData({ $axios }) {
    let files = await $axios.$get("http://localhost:5050/api/upload");
    return { files };
  },
  data() {
    return {
      totalSupple: "",
      valid: true,
      show: false,
      typeToken: "Standard Token",
      routerSelect: "MyTeamCoin",
      reward: "0xc99a0aD9Fb77E74Dda20AC805223B760Ad3bDfd5",
      items: ["Standard Token", "MyTeamFinance"],
      router: ["MyTeamCoin", "Pancakeswap"],
      rules: [
        (value) => !!value || "token name required.",
        (value) => (value && value.length >= 5) || "Min 5 characters",
      ],
      symbol: [
        (value) => !!value || "symbol is required.",
        (value) => (value && value.length >= 3) || "Min 3 characters",
      ],
      decimals: [
        (value) => !!value || "decimals required.",
        (value) => (value && value.length >= 2) || "Min 2 characters",
      ],
      loader: null,
      loading3: false,
    };
  },
  watch: {
    loader() {
      const l = this.loader;
      this[l] = !this[l];
      setTimeout(() => (this[l] = false), 1500);
      this.loader = null;
    },
  },
  methods: {
    block2() {
      this.show = !this.show;

      if (this.typeToken === "Standard Token") {
        loadFactory("StandardToken");
      } else {
        loadFactory("BabyToken");
      }
    },
    validate() {
      this.$refs.form.validate();
    },
  },
  mounted() {
    VANTA.RINGS({
      el: "#anime-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      backgroundColor: 0x000e2d,
    });

    function loadFactory(name) {}
  },
};
</script>
<style>
.v-application a {
  color: #fff;
}
body,
html {
  background: #000e2d;
}
html::-webkit-scrollbar {
  width: 0;
}
#anime-bg::-webkit-scrollbar {
  width: 8px;
}
#anime-bg::-webkit-scrollbar-thumb {
  background: #e4c239;
  border-radius: 10px;
}

input[type="number"] {
  -moz-appearance: textfield;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
#anime-bg {
  position: absolute;
  overflow-x: hidden;
  width: 100%;
  max-height: 100vh;
  min-height: 100vh;
  height: auto;
  margin-bottom: 100px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000e2d;
}
.navbar {
  width: 100%;
}

.block2.active {
  display: none;
}
.navbar__body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1366px;
  padding: 25px 25px 0;
}
.navbar__logo {
  font-size: 22px;
}
.navbar__logo span {
  color: #e4c239;
}
.navbar__btn a {
  text-decoration: none;
  color: #fff !important;
  font-size: 14px;
  background-image: linear-gradient(
    to right,
    #00c1cf 0%,
    #5472d2 0%,
    #00c1cf 100%
  );
  background-color: #00c1cf;
  padding: 12px 20px;
  border-radius: 5px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
}
#create {
  background-image: linear-gradient(
    to right,
    #00c1cf 0%,
    #5472d2 0%,
    #00c1cf 100%
  );
  background-color: #00c1cf;
}
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
.v-input__slot {
  position: relative;
  /*background: #001234;*/
  padding: 10px 0 5px;
}
.v-select {
  position: relative;
}
.bg-logo {
  position: absolute;
  top: 36.5vh;
  left: 58vw;
  transform: translate(-50%, -50%);
  width: 270px;
  height: 270px;
  animation: logo-anime linear 18s infinite;
}
@media (max-width: 1440px) {
  .bg-logo {
    position: absolute;
    top: 40.5vh;
    left: 58vw;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    animation: logo-anime linear 18s infinite;
  }
}
@media (max-width: 1366px) {
  .bg-logo {
    top: 33vh;
    left: 56vw;
  }
}
@media (max-width: 1024px) {
  .bg-logo {
    top: 41.5vh;
    left: 75vw;
    width: 270px;
    height: 270px;
  }
}
@media (max-width: 768px) {
  .bg-logo {
    position: absolute;
    top: 39.5vh;
    left: 71vw;
    width: 250px;
    height: 250px;
  }
}
@media (max-width: 414px) {
  .bg-logo {
    position: absolute;
    top: 38vh;
    left: 72vw;
    width: 200px;
    height: 200px;
  }
}
@keyframes logo-anime {
  0% {
    -webkit-transform: rotate(0);
    -moz-transform: rotate(0);
    -ms-transform: rotate(0);
    -o-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
