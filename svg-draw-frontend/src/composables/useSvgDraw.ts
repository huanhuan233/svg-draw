import { ref, type Ref } from 'vue'
import { svgDrawService } from '../services/svgDrawService'
import type { SvgDraw, CreateSvgDrawParams } from '../utils/types'
import { ElMessage } from 'element-plus'

export function useSvgDrawList() {
  const list: Ref<SvgDraw[]> = ref([])
  const loading = ref(false)

  const fetchList = async () => {
    loading.value = true
    try {
      list.value = await svgDrawService.getList()
    } catch (error: any) {
      ElMessage.error(error.message || '获取列表失败')
    } finally {
      loading.value = false
    }
  }

  return {
    list,
    loading,
    fetchList,
  }
}

export function useSvgDrawCreate() {
  const loading = ref(false)

  const create = async (params: CreateSvgDrawParams) => {
    loading.value = true
    try {
      const result = await svgDrawService.create(params)
      ElMessage.success('创建成功')
      return result
    } catch (error: any) {
      ElMessage.error(error.message || '创建失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    create,
  }
}

export function useSvgDrawDelete() {
  const loading = ref(false)

  const deleteDraw = async (id: number) => {
    loading.value = true
    try {
      await svgDrawService.delete(id)
      ElMessage.success('删除成功')
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    deleteDraw,
  }
}
