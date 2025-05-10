import {defineStore} from 'pinia'

import {ref} from 'vue'

export const userInfoStore = defineStore('userInfo' , () => {
    const info = ref('')
    const messageNum = ref('')

    const setInfo = (newInfo) => {
        info.value = newInfo
    }

    const setMessageNum = (num) =>{
        messageNum.value = num
    }

    const removeInfo = () => {
        info.value = '';
        messageNum.value = '';
    }

    return{
        info,
        messageNum,
        setInfo,
        removeInfo,
        setMessageNum
    }


},
    {
        persist:true    //持久化存储
    })

