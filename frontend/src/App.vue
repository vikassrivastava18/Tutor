<template>
    <main>
        <div class="d-flex align-items-center justify-content-between gap-3 p-2">
            <header>
                <HeaderComponent />
            </header>

            <NavComponent />
        </div>
        <div class="page-container my-4">
            <div class="mt-2" id="routeContent">
                <RouterView />
            </div>
        </div>
    </main>

</template>

<script setup>
import HeaderComponent from './components/HeaderComponent.vue';
import NavComponent from './components/NavComponent.vue';

</script>

<style scoped>
h2,
h3,
h4 {
    font-weight: 400;
}

.page-container {
    width: 90vw;
    min-width: 90vw;
    margin-inline: auto;
}

#routeContent {
    /* border: 1px solid #d1d5db; */
    border-radius: 10px;
    min-height: 90vh;
    width: 100%;
    max-width: 85vw;
    margin-inline: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    background-color: black;
}
</style>
