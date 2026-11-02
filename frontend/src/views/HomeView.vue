<template>

  <!-- Introductory content for the tutor application. -->
  <section class="py-4">
    <div class="container">
      <div class="row g-5">

        <!-- Image Column -->
        <div class="col-lg-6">
          <img src="../assets/duck_cs50.png"
            width="600"
            alt="About CS50" class="rounded-4 shadow-lg w-80 mt-0" />
        </div>

        <!-- Content Column -->
        <div class="col-lg-6">
          <!-- Main Heading -->
          <h2 class="fw-bold mt-4">
            About
          </h2>

          <!-- Paragraph -->
          <p class="text-white fs-5 lh-lg">
            <i>Tutor</i> is an educational application designed to support CS50 students. 
            <br>Learn, ask questions, write code, and keep trying until you get it right.
            <br>Ask the friendly tutor duck for guidance.
            <br>Need help with a coding challenge? Request tutor duck for a hint.
            <br>But remember, no shortcuts, copying, pasting acceptable.
             
          </p>
        </div>
      </div>
    </div>
  </section>

</template>

<style scoped>
  h2 {
    color: #dd7c7c;
  }
  .letter-spacing {
    letter-spacing: 1px;
  }

  .object-fit-cover {
    object-fit: cover;
    max-height: 650px;
  }

</style>