// WordPress REST API integration for data storage
export interface WordPressResponse {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  meta: {
    [key: string]: any;
  };
  date: string;
  modified: string;
}

export interface WordPressCreatePost {
  title: string;
  content: string;
  status: 'publish' | 'draft' | 'private';
  meta: {
    [key: string]: any;
  };
}

export class WordPressAPI {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.username = username;
    this.password = password;
  }

  private getAuthHeaders(): HeadersInit {
    const credentials = btoa(`${this.username}:${this.password}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  // Create a new post
  async createPost(postData: WordPressCreatePost): Promise<WordPressResponse> {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Update an existing post
  async updatePost(postId: number, postData: Partial<WordPressCreatePost>): Promise<WordPressResponse> {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${postId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get posts with optional filters
  async getPosts(params: {
    per_page?: number;
    page?: number;
    search?: string;
    meta_key?: string;
    meta_value?: string;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WordPressResponse[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get a single post by ID
  async getPost(postId: number): Promise<WordPressResponse> {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${postId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Delete a post
  async deletePost(postId: number): Promise<WordPressResponse> {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${postId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Athlete-specific WordPress integration
export class AthleteWordPressStorage {
  private api: WordPressAPI;

  constructor(api: WordPressAPI) {
    this.api = api;
  }

  async saveAthlete(athleteData: any): Promise<string> {
    const postData: WordPressCreatePost = {
      title: `Sporcu: ${athleteData.name} ${athleteData.surname}`,
      content: JSON.stringify(athleteData),
      status: 'private',
      meta: {
        athlete_id: athleteData.id || `athlete-${Date.now()}`,
        athlete_name: athleteData.name,
        athlete_surname: athleteData.surname,
        athlete_tc: athleteData.tc,
        athlete_phone: athleteData.phone,
        parent_name: athleteData.parentName,
        parent_phone: athleteData.parentPhone,
        branch: athleteData.branch,
        birth_date: athleteData.birthDate,
        data_type: 'athlete'
      }
    };

    const response = await this.api.createPost(postData);
    return response.id.toString();
  }

  async getAthletes(): Promise<any[]> {
    const posts = await this.api.getPosts({
      meta_key: 'data_type',
      meta_value: 'athlete',
      per_page: 100,
      orderby: 'date',
      order: 'desc'
    });

    return posts.map(post => {
      try {
        return JSON.parse(post.content.rendered);
      } catch (error) {
        console.error('Error parsing athlete data:', error);
        return null;
      }
    }).filter(Boolean);
  }

  async updateAthlete(athleteId: string, athleteData: any): Promise<void> {
    // Find the post by athlete_id meta
    const posts = await this.api.getPosts({
      meta_key: 'athlete_id',
      meta_value: athleteId,
      per_page: 1
    });

    if (posts.length === 0) {
      throw new Error(`Athlete with ID ${athleteId} not found`);
    }

    const postData: Partial<WordPressCreatePost> = {
      title: `Sporcu: ${athleteData.name} ${athleteData.surname}`,
      content: JSON.stringify(athleteData),
      meta: {
        athlete_id: athleteId,
        athlete_name: athleteData.name,
        athlete_surname: athleteData.surname,
        athlete_tc: athleteData.tc,
        athlete_phone: athleteData.phone,
        parent_name: athleteData.parentName,
        parent_phone: athleteData.parentPhone,
        branch: athleteData.branch,
        birth_date: athleteData.birthDate,
        data_type: 'athlete'
      }
    };

    await this.api.updatePost(posts[0].id, postData);
  }

  async deleteAthlete(athleteId: string): Promise<void> {
    const posts = await this.api.getPosts({
      meta_key: 'athlete_id',
      meta_value: athleteId,
      per_page: 1
    });

    if (posts.length === 0) {
      throw new Error(`Athlete with ID ${athleteId} not found`);
    }

    await this.api.deletePost(posts[0].id);
  }
}

// Generic data storage for other modules
export class GenericWordPressStorage {
  private api: WordPressAPI;

  constructor(api: WordPressAPI) {
    this.api = api;
  }

  async saveData(dataType: string, data: any, id?: string): Promise<string> {
    const dataId = id || `${dataType}-${Date.now()}`;
    
    const postData: WordPressCreatePost = {
      title: `${dataType}: ${dataId}`,
      content: JSON.stringify(data),
      status: 'private',
      meta: {
        data_id: dataId,
        data_type: dataType,
        created_at: new Date().toISOString()
      }
    };

    const response = await this.api.createPost(postData);
    return response.id.toString();
  }

  async getData(dataType: string): Promise<any[]> {
    const posts = await this.api.getPosts({
      meta_key: 'data_type',
      meta_value: dataType,
      per_page: 100,
      orderby: 'date',
      order: 'desc'
    });

    return posts.map(post => {
      try {
        const data = JSON.parse(post.content.rendered);
        return {
          ...data,
          wp_post_id: post.id,
          created_at: post.date,
          modified_at: post.modified
        };
      } catch (error) {
        console.error(`Error parsing ${dataType} data:`, error);
        return null;
      }
    }).filter(Boolean);
  }

  async updateData(dataType: string, dataId: string, data: any): Promise<void> {
    const posts = await this.api.getPosts({
      meta_key: 'data_id',
      meta_value: dataId,
      per_page: 1
    });

    if (posts.length === 0) {
      throw new Error(`${dataType} with ID ${dataId} not found`);
    }

    const postData: Partial<WordPressCreatePost> = {
      title: `${dataType}: ${dataId}`,
      content: JSON.stringify(data),
      meta: {
        data_id: dataId,
        data_type: dataType,
        updated_at: new Date().toISOString()
      }
    };

    await this.api.updatePost(posts[0].id, postData);
  }

  async deleteData(dataType: string, dataId: string): Promise<void> {
    const posts = await this.api.getPosts({
      meta_key: 'data_id',
      meta_value: dataId,
      per_page: 1
    });

    if (posts.length === 0) {
      throw new Error(`${dataType} with ID ${dataId} not found`);
    }

    await this.api.deletePost(posts[0].id);
  }
}