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
                 :to="{ name: 'c-compiler' }"
                 class="nav-link text_white px-4 py-1 me-2"
                 :class="{ 'c-active': $route.name === 'c-compiler' }">
                 C
             </router-link>
             <router-link 
                :to="{ name: 'topics'}"
                class="nav-link text_white px-4 py-1 me-2" 
                :class="{ 'python-active': $route.fullPath.includes('python') }">
                PYTHON
             </router-link>
             <!-- <router-link 
                :to="{}"
                class="nav-link text_white px-4 py-1 me-2">                
                SQL
             </router-link>
             <router-link 
                :to="{}"
                class="nav-link text_white px-4 py-1 me-2">                
                Agents
             </router-link>   
             <router-link 
                :to="{}"
                class="nav-link text_white px-4 py-1 me-2">                
                Cybersecurity
             </router-link>            -->
        </div>
    </nav>
</template>

<style scoped>
    /* nav {
        text-align: left;
        border: 1px dotted grey;
        border-radius: 5px;
        background: linear-gradient(90deg, #dcdfe2 0%, #435260 50%, #1b2e3f 100%); 
    } 
    */

    .nav-link {
        font-size: large;
        color: #000;
        border-radius: 999px;
        font-weight: 400;
        letter-spacing: 0.04em;
        text-decoration: none;
        transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }

    .nav-link:hover {
        background-color: #e8fbe5;
        color: #173d13;
        transform: translateY(-2px);
    }

    .nav-link:focus-visible {
        outline: 2px solid #388e2f;
        outline-offset: 3px;
    }

    .router-link-exact-active, .router-link-active, .python-active, .c-active {
        background-color: #7ef473;
        border: none;
        color: #000;
    }

    .router-link-exact-active:hover, .router-link-active:hover, .python-active:hover, .c-active:hover {
        background-color: #68df5c;
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