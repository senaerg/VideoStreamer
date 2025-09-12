import { connectToDatabase } from '@/lib/db'
import CategoryModel from '@/models/CategoryModel'
import React, { cache } from 'react'
import TopSectionCategories from './TopSectionCategories'

const getCategories = cache(async() => {
    try {
        await connectToDatabase()
        const result = await CategoryModel.find({})
        const categories: {name: string, id: string}[] = result.map(item => ({name: item.name, id: item._id.toString()}))
        return categories
    } catch (error) {
        return []
    }
})

const TopCategoriesServer = async() => {
    try {
        const categories = await getCategories()
        return <TopSectionCategories categories={categories} />
    } catch (error) {
        return null
    }
}

export default TopCategoriesServer
