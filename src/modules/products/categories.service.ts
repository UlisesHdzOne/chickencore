import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Verificar que no exista una categoría con el mismo nombre
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Ya existe una categoría con el nombre "${createCategoryDto.name}"`
      );
    }

    return this.prisma.category.create({
      data: createCategoryDto,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            presentation: true,
            price: true,
            imageUrl: true,
            stockQuantity: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Verificar que la categoría existe
    await this.findOne(id);

    // Si se actualiza el nombre, verificar unicidad
    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException(
          `Ya existe una categoría con el nombre "${updateCategoryDto.name}"`
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async remove(id: number) {
    // Verificar que la categoría existe
    await this.findOne(id);

    // Verificar que no tenga productos asociados
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la categoría porque tiene productos asociados'
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  async reorderCategories(categoryOrders: { id: number; sortOrder: number }[]) {
    const updatePromises = categoryOrders.map(({ id, sortOrder }) =>
      this.prisma.category.update({
        where: { id },
        data: { sortOrder },
      })
    );

    await Promise.all(updatePromises);

    return this.findAll();
  }
}