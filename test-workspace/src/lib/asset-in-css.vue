<!--
@author Toru Nagashima
@copyright 2017 Toru Nagashima. All rights reserved.
See LICENSE file in root directory for full license.
-->
<template>
    <div>
        <i class="material-icons">favorite</i>
        Hello, {{name}}!<br>
    </div>
</template>

<style>
@import "material-design-icons/iconfont/material-icons.css";

.small {
    background: url(small-in-css.png);
}
.big {
    background: url(big-in-css.gif);
}
.material-icons {
    color: pink;
}
</style>

<script>
export default {
    name: "asset-in-css",
    data() {
        return {name: "World!"}
    },
}

</script>
