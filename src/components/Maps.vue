<template>
  <div id="mainMap" class="body-css-map">

    <l-map ref="map" :max-bounds="maxBounds" :zoom="zoom" :minZoom="minZoom" :center="center" :options="{ zoomControl: false, attributionControl: false }">
      <l-tile-layer :url="url"></l-tile-layer>
      <l-marker :key="index" v-for="(dat, index) in perpus" :lat-lng="dat.LatLng" @click="selectMarker(dat)">
        <l-tooltip class="tooltips">
          <div>
            {{ perpus[index].nama }}
          </div>
        </l-tooltip>
        <l-icon
          :icon-url="img_icon" 
          :icon-size="dynamicSize"
        />
      </l-marker>
    </l-map>

    <!-- Modal -->
    <b-modal centered hide-footer id="modal-uploadBooks" ref="modal-uploadBooks" :title="namaPerpustakaan">
      <div class="mb-3">
        <div class="mb-2">
          <b-form-input v-model="title" placeholder="Judul Buku"></b-form-input>
        </div>
        <div class="mb-2">
          <b-form-select v-model="Author" value-field="id" text-field="firstName" :options="allAuthors" class="mb-3">
            <template #first>
              <b-form-select-option :value="null" disabled>Penulis Buku</b-form-select-option>
            </template>
          </b-form-select>          
        </div>
      </div>
      <div class="row">
        <div class="col">
          <b-button class="container-fluid" variant="success" @click="addData(perpusID)"> Submit </b-button>
        </div>
      </div>
    </b-modal>
    <b-modal centered hide-footer id="modal-dataBooks" ref="modal-dataBooks" :title="namaPerpustakaan">
      <div>
        <b-table sticky-header responsive :items="itemsBooks" :fields="fieldsItemsBooks">
          <!-- <template #table-busy>
              <div class="text-center text-danger my-2">
                  <b-spinner class="align-middle"></b-spinner>
                  <strong> Loading...</strong>
              </div>
          </template> -->
            <template #cell()="data">
              <div>
                {{ data.value }}
              </div>
            </template>
        </b-table>
      </div>     

      <div>
        <b-button variant="success" class="float-right" @click="showUploadData()"> Upload Data </b-button>
      </div>      

    </b-modal>     

  </div>
</template>

<script>
import { 
  MUTATION_CREATE_BOOK, 
  QUERY_ALL_BOOKS, 
  QUERY_ALL_AUTHORS 
} from '../graph/graphql'

import {  LMap, 
  LTileLayer,
  LControlZoom,
  LMarker,
  LPolyline,
  LTooltip,
  LIcon } from 'vue2-leaflet';
import { latLngBounds } from "leaflet";

const dataPerpus = require('../../latLonPerpustakaan.json');

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LControlZoom,
    LPolyline,
    LTooltip
  },
  data () {
    return {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      img_icon: require("../assets/marker-icon-2x.png"),
      iconSize: 30,
      zoom: 7,
      maxZoom: 7,
      minZoom: 7,
      center: [-7.949497, 113.9731265],
      markerLatLng: [-7.803249,110.3398253],
      maxBounds: latLngBounds([
      [84.052561, -33.046875],
      [-66.569237, 400.921862],
      ]),  
      tmpDataInsert: "",
      namaPerpustakaan: '',
      perpus: [],
      perpusID: "",
      allBooks: [],
      allAuthors: [],
      itemsBooks: [],
      title: "",
      locationID: "",
      Author: null,
      optionsAuthor: [],
      fieldsItemsBooks: [
        {
          key: "title",
          label: "Judul Buku",
        },
        {
          key: "Author.firstName",
          label: "Pengarang",
        }
      ],                
    };
  },
  apollo: {
    allBooks: {
      query: QUERY_ALL_BOOKS
    },
    allAuthors: {
      query: QUERY_ALL_AUTHORS
    },
  },
  methods: {
    loadDataPerpustakaan(){
      this.perpus = dataPerpus;
    },
    showUploadData(){
      this.$refs['modal-dataBooks'].hide();
      this.$refs['modal-uploadBooks'].show();
    },
    async addData(uid) {
      this.locationID = uid;
      this.$refs['modal-uploadBooks'].hide();
      const { title, locationID, Author } = this.$data
      const res = await this.$apollo.mutate({
        mutation: MUTATION_CREATE_BOOK,
        variables: {
          title,
          locationID,
          Author
        },
        update: (store, { data: { createBook } }) => {
          const data = store.readQuery({
            query: QUERY_ALL_BOOKS,
          })
          data.allBooks.push(createBook)
          store.writeQuery({
            query: QUERY_ALL_BOOKS,
            data
          })
        },
      })
      .then(() => {
        this.$apollo.query({
          query: QUERY_ALL_BOOKS
        })
      })
      .catch((error) => {
        console.error(error);
      })

      if(this.Author){        
        this.Author = null;
        this.title = "";
        this.locationID  = "";
      }
    },
    selectMarker(uDat){
      this.setItemBooks(uDat.id);
      this.perpusID = uDat.id;
      this.namaPerpustakaan = uDat.nama;
      this.$refs['modal-dataBooks'].show();
    },
    setItemBooks(sDat){
      this.itemsBooks = [];
      this.allBooks.forEach(e => {
        if(e.locationID == sDat){
          this.itemsBooks.push(e);
        }
      })
    }
  },
  computed: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1];
    }
  },
  created() {
    this.loadDataPerpustakaan();
  }
}
</script>

<style scoped>
  .body-css-map {
    z-index: 1;
    height: 100%;
    width: 100%;
    position: fixed;
  }

  #mainMap{
    transition: margin-left 0.3s; 
    overflow: hidden;
    width: 100vw !important;
  }
</style>