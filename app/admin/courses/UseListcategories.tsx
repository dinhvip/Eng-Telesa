import { useState, useEffect } from 'react';
import apiClient from "../../../lib/axios";

export interface Category {
    id: number;
    name: string;
    slug: string | null;
    status: number;
    created_at: string;
    updated_at: string;
}

export function useListCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await apiClient.get('/categories');
            const responseData = response?.data || response;
            
            if (responseData && responseData.data && Array.isArray(responseData.data)) {
                setCategories(responseData.data);
            } else if (Array.isArray(responseData)) {
                setCategories(responseData);
            } else {
                setCategories([]);
            }
        } catch (err: any) {
            setErrorCategories(err.message || 'Lỗi khi tải danh mục');
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, loadingCategories, errorCategories, fetchCategories };
}

export function useListCourseCategories() {
    const [courseCategories, setCourseCategories] = useState<Category[]>([]);
    const [loadingCourseCategories, setLoadingCourseCategories] = useState<boolean>(true);

    const fetchCourseCategories = async () => {
        try {
            setLoadingCourseCategories(true);
            const response = await apiClient.get('/course/categories');
            const responseData = response?.data || response;

            if (responseData && responseData.data && Array.isArray(responseData.data)) {
                setCourseCategories(responseData.data);
            } else if (Array.isArray(responseData)) {
                setCourseCategories(responseData);
            } else {
                setCourseCategories([]);
            }
        } catch (err: any) {
            setCourseCategories([]);
        } finally {
            setLoadingCourseCategories(false);
        }
    };

    useEffect(() => {
        fetchCourseCategories();
    }, []);

    return { courseCategories, loadingCourseCategories, fetchCourseCategories };
}

export default useListCategories;
