import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'

const { copy, copied} = useClipboard()
export const copyToClipboard = async (str) => {
    await copy(str)
    if (copied.value) {
        ElMessage.success('复制成功')
    } else {
        ElMessage.error('复制失败')
    }
}