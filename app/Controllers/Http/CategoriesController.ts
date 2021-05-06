/**
 * The CategoriesController contains all the methods that are available to
 * perform on {@link Category | category models} in the system.
 *
 * For now, its only a hook for fetching the available categories in the system
 *
 *
 * @category Controller
 * @module CategoriesController
 */
import Category from 'App/Models/Category'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CategoriesController {
    /**
     * fetch all nations from system
     */
    public async index({}: HttpContextContract) {
        const categories = await Category.all()

        return categories.map((category: Category) => category.toJSON())
    }
}
