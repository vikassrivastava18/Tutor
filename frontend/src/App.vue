<template>
    <main>
        <div class="container my-2">
            <div class="innerContainer p-2">
                <div class="d-flex align-items-center justify-content-between gap-3">
                    <header>
                        <HeaderComponent />
                    </header>

                    <NavComponent />
                </div>

                <div class="tab-content mt-2" id="routeContent">
                    <RouterView />
                </div>
            </div>
        </div>
    </main>
  
</template>

<script setup>
import HeaderComponent from './components/HeaderComponent.vue';
import NavComponent from './components/NavComponent.vue';

</script>

<style scoped>

    h2, h3, h4 {
        font-weight: 400;
    }

    #routeContent {
        border: 1px solid #d1d5db;
        border-radius: 10px;
        min-height: 90vh;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

</style>
