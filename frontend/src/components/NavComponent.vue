<template>
    <!-- Main navigation links. -->
    <nav class="p-2 navbar">
        <div class="d-flex justify-content-end">
            <router-link 
                :to="{name: 'home'}" 
                class="nav-link text_white px-4 py-1 me-2">
              HOME
            </router-link>
             <router-link 
                :to="{ name: 'topics'}"
                class="nav-link text_white px-4 py-1 me-2" 
                :class="{ 'python-active': $route.fullPath.includes('python') }">
                PYTHON
             </router-link>
             <router-link
                 :to="{ name: 'c-compiler' }"
                 class="nav-link text_white px-4 py-1 me-2"
                 :class="{ 'c-active': $route.name === 'c-compiler' }">
                 C
             </router-link>
        </div>
    </nav>
</template>

<style scoped>
    nav {
        text-align: left;
        border: 1px dotted grey;
        border-radius: 5px;
        /* background: linear-gradient(90deg, #dcdfe2 0%, #435260 50%, #1b2e3f 100%); */
    }

    .nav-link {
        margin-right: 10px;
        font-size: large;
        color: #000;
    }

    .router-link-exact-active, .router-link-active, .python-active, .c-active {
        background-color: #7ef473;
        border: none;
        color: #000;
    }

    .text_white {
        color: #000;
    }

    .navbar {
        color: #000;
    }
    img {
        float: right;
    }
</style>