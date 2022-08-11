<template>
  <div>  
    <div id="maps">
      <Maps/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Maps from '@/components/Maps.vue'

export default {
  name: 'Home',
  components: {
    Maps
  }
}
</script>
