<template>
  <section class="dashboard-container table-container">
    <h3>전체 유저 정보 ({{ users.length }}명)</h3>
    <div class="table-scroll-wrapper">
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>등급</th>
            <th>최종 접속일</th>
            <th>최종 참여일</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in usersWithGrades"
            :key="user.name"
            @click="select(user)"
            :class="{
              selected: selectedUser && selectedUser.name === user.name,
            }"
          >
            <td>{{ user.name }}</td>
            <td>{{ user.grade.icon }} {{ user.grade.name }}</td>
            <td>{{ user.lastAccessDate }}</td>
            <td>{{ user.lastParticipationDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";
const props = defineProps({ users: Array, selectedUser: Object });
const emit = defineEmits(["select-user"]);

const grades = {
  newbie: { name: "신입", icon: "🐥" },
  steady: { name: "꾸준", icon: "📈" },
  enthusiast: { name: "열혈", icon: "🔥" },
  inactive: { name: "미참여", icon: "👻" },
};

function getUserGrade(participationCount) {
  if (participationCount === 0) return grades.inactive;
  if (participationCount <= 3) return grades.newbie;
  if (participationCount < 10) return grades.steady;
  return grades.enthusiast;
}

const usersWithGrades = computed(() => {
  return props.users.map((user) => ({
    ...user,
    grade: getUserGrade(user.participationCount),
  }));
});

function select(user) {
  emit("select-user", user);
}
</script>
