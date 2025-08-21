<template>
  <div class="w-full h-full flex flex-row">
    <div class="flex-1/3 flex flex-col justify-start gap-2">
      <div class="w-100">
        <label for="LineCode">Line ID : </label>
        <div class="flex flex-row items-center gap-2 w-full">
          <input v-model="model.id" type="text" placeholder="Line ID" class="input" disabled />
          <button @click="reset" v-if="isEdit" class="btn btn-accent">Reset</button>
          <span v-if="isEdit" class="text-amber-400 w-full">Edit Mode</span>
        </div>
      </div>
      <div class="flex flex-row gap-3 flex-wrap">
        <div class="w-60">
          <label for="LineCode">Line Code</label>
          <input v-model="model.lineCode" type="text" placeholder="LineCode" class="input" />
        </div>
        <div class="w-60">
          <label for="LineName">Line Name</label>
          <input v-model="model.lineName" type="text" placeholder="LineName" class="input" />
        </div>
        <div class="w-60">
          <label for="Factory">Factory</label>
          <select class="select" v-model="model.factoryCode">
            <option disabled selected>Choose Factory</option>
            <option v-for="line in lines" :key="line.id" :value="line.id">
              {{ line.name }}
            </option>
          </select>
        </div>
        <div class="w-60">
          <label for="LineType">Line Type</label>
          <select class="select" v-model="model.lineType">
            <option disabled selected>Choose Line Type</option>
            <option v-for="item in lineType" :key="item.name" :value="item.name">
              {{ item.name }}
            </option>
          </select>
        </div>
        <div class="w-60">
          <label for="CapMP">CapMP</label>
          <input
            type="number"
            class="input validator"
            required
            placeholder="Type a number CapMP"
            min="1"
            max="200"
            title="Must be between be 1 to 200"
            v-model="model.capacityMP"
          />
        </div>
        <div class="w-60">
          <label for="DefaultHours">DefaultHours</label>
          <input
            type="number"
            class="input validator"
            required
            placeholder="Type a number DefaultHours"
            min="1"
            max="200"
            title="Must be between be 1 to 200"
            v-model="model.defaultHours"
          />
        </div>
      </div>
    </div>
    <div class="flex-1/2 h-full overflow-auto border-1">
      <div class="flex flex-col my-6">
        <div
          v-for="item in masterline"
          class="card card-border bg-base-100 w-full p-1 px-4"
          @click="selectEdit(item)"
        >
          <div
            class="card-body gap-3 p-3 border-1 rounded-2xl hover:bg-base-300 transition-all ease-in duration-100 cursor-pointer"
          >
            <h2 class="card-title border-b-1 border-b-gray-400 pb-3">
              <span class="text-sky-700">LineCode : {{ item.lineCode }}</span>
              <span>LineName : {{ item.lineName }} </span>
            </h2>
            <table class="">
              <thead>
                <tr class="p-0 text-sky-500 font-semibold">
                  <th>CapMP</th>
                  <th>DefaultHours</th>
                  <th>Factory</th>
                  <th>LineType</th>
                </tr>
              </thead>
              <tbody>
                <tr class="text-center">
                  <td>{{ item.capacityMP }}</td>
                  <td>{{ item.defaultHours }}</td>
                  <td>{{ item.factoryCode }}</td>
                  <td>{{ item.lineType }}</td>
                </tr>
              </tbody>
            </table>
            <!-- <div class="card-actions justify-end">
              <button class="btn btn-primary">Buy Now</button>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMaster } from '@/stores/masterStore'
import type { MasterLine } from '@/type/types'
import { ref, onMounted, watch, watchEffect, reactive } from 'vue'

const isEdit = ref<boolean>(false)
const lines = [
  { id: '1', name: 'YPT' },
  { id: '2', name: 'GNX' },
  { id: '3', name: 'RACHABURI' },
]

const lineType = [
  { name: 'ALL' },
  { name: '_None' },
  { name: 'Accessories' },
  { name: 'Baseball Shirt' },
  { name: 'BG' },
  { name: 'BG V' },
  { name: 'Jacket' },
  { name: 'Jacket FZ' },
  { name: 'Jacket HD' },
  { name: 'Jacket HZ' },
  { name: 'NURSE PANTS' },
  { name: 'NURSE SCRUB' },
  { name: 'Pants' },
  { name: 'Pants BG' },
  { name: 'Polo Long arm' },
  { name: 'Polo Short arm' },
  { name: 'SKIRT' },
  { name: 'Tight' },
  { name: 'T-Shirt' },
  { name: 'T-Shirt+Pants' },
  { name: 'Underwear' },
]
const masterline = ref<MasterLine[]>([])
const STORE_MASTER = useMaster()
const model = reactive<MasterLine>({
  id: 0,
  lineCode: '',
  lineName: '',
  lineType: 'Choose Line Type',
  factoryCode: 'Choose Factory',
  capacityMP: 0,
  defaultHours: 0,
  isActive: false,
  status: 1,
  remark: '',
  createBy: '',
  createDate: new Date(),
  updateBy: '',
  updateDate: new Date(),
})

const selectEdit = (masterline: MasterLine) => {
  model.id = masterline.id
  model.lineCode = masterline.lineCode
  model.lineName = masterline.lineName
  model.factoryCode = masterline.factoryCode
  model.lineType = masterline.lineType
  model.capacityMP = masterline.capacityMP
  model.defaultHours = masterline.defaultHours
  isEdit.value = true
}

const reset = () => {
  model.id = 0
  model.lineCode = ''
  model.lineName = ''
  model.factoryCode = ''
  model.lineType = ''
  model.capacityMP = 0
  model.defaultHours = 0
  isEdit.value = false
}

watchEffect(() => {
  masterline.value = STORE_MASTER.masterLine
})

onMounted(() => {
  masterline.value = STORE_MASTER.masterLine
})
</script>

<style scoped></style>
