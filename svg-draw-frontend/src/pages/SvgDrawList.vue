<template>
  <div class="svg-draw-list-page">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">SVG 绘图列表</span>
          <el-button type="primary" @click="handleCreate">新建</el-button>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="新建 SVG 绘图"
      width="600px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="SVG 内容">
          <el-input
            v-model="form.svg_content"
            type="textarea"
            :rows="6"
            placeholder="请输入 SVG 内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="createLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useSvgDrawList, useSvgDrawCreate, useSvgDrawDelete } from '../composables/useSvgDraw'

const { list, loading, fetchList } = useSvgDrawList()
const { loading: createLoading, create } = useSvgDrawCreate()
const { deleteDraw } = useSvgDrawDelete()

const dialogVisible = ref(false)
const form = reactive({
  name: '',
  svg_content: '',
})

const handleCreate = () => {
  form.name = ''
  form.svg_content = ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name || !form.svg_content) {
    return
  }
  try {
    await create(form)
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    // 错误已在 composable 中处理
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteDraw(id)
    fetchList()
  } catch (error) {
    // 错误已在 composable 中处理
  }
}

// 初始化加载列表
fetchList()
</script>

<style scoped>
.svg-draw-list-page {
  padding: 24px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.main-card {
  background-color: #ffffff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
}

.card-title {
  font-size: 16px;
  font-weight: 400;
  color: #1d121b;
}
</style>
