<!--
@author Toru Nagashima
@copyright 2017 Toru Nagashima. All rights reserved.
See LICENSE file in root directory for full license.
-->
<template>
    <div>
        <img :src="bigImage" class="big">
        <img :src="smallImage" class="small">
    </div>
</template>

<script>
import bigImage from "./big-in-js.gif"
import smallImage from "./small-in-js.png"

const {1: e} = "Hello"

export default {
    name: "asset-in-js",
    data() {
        return {bigImage, smallImage, e}
    },
}
</script>
