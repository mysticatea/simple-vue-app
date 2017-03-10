<!--
@author Toru Nagashima
@copyright 2017 Toru Nagashima. All rights reserved.
See LICENSE file in root directory for full license.
-->
<template>
    <div>
        <i class="material-icons">favorite</i>
        Hello, {{name}}!
    </div>
</template>

<style scoped>
@import "material-design-icons/iconfont/material-icons.css";

.small {
    background: url(small.png);
}
.big {
    background: url(big.gif);
}
.material-icons {
    color: pink;
}
</style>

<script>
"use strict"

module.exports = {
    name: "hello",
    data() {
        return {name: "World!"}
    },
}
</script>
