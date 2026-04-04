import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ToughtNet API',
    version: '1.0.0',
    description:
      'AI-powered knowledge management backend. Save, tag, summarise and semantically search your content with Gemini AI.',
    contact: { name: 'ToughtNet', email: 'support@toughtnet.dev' },
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local dev server' },
  ],
  tags: [
    { name: 'Auth',        description: 'User registration, login, logout & profile' },
    { name: 'Content',     description: 'CRUD for saved content items + AI processing' },
    { name: 'Collections', description: 'Organise content into collections' },
    { name: 'Search',      description: 'Full-text & semantic search, tags, graph, related' },
    { name: 'Health',      description: 'API health check' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'jwt',
        description: 'JWT stored in an httpOnly cookie. Login first to set this automatically.',
      },
    },
    schemas: {
      /* ── Shared primitives ─────────────────────── */
      ObjectId: {
        type: 'string',
        pattern: '^[a-f\\d]{24}$',
        example: '661e2abc1234567890abcdef',
      },
      Timestamp: {
        type: 'object',
        properties: {
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      /* ── User ────────────────────────────────── */
      User: {
        type: 'object',
        properties: {
          _id:   { $ref: '#/components/schemas/ObjectId' },
          name:  { type: 'string', example: 'Uday Vaidya' },
          email: { type: 'string', format: 'email', example: 'uday@example.com' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string', example: 'Uday Vaidya' },
          email:    { type: 'string', format: 'email', example: 'uday@example.com' },
          password: { type: 'string', minLength: 6, example: 'secret123' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', example: 'uday@example.com' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      /* ── Highlight ───────────────────────────── */
      Highlight: {
        type: 'object',
        properties: {
          _id:       { $ref: '#/components/schemas/ObjectId' },
          text:      { type: 'string', example: 'This is important.' },
          note:      { type: 'string', example: 'Remember this.' },
          color:     { type: 'string', example: '#facc15' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      HighlightInput: {
        type: 'object',
        required: ['text'],
        properties: {
          text:  { type: 'string', example: 'This is important.' },
          note:  { type: 'string', example: 'Remember this.' },
          color: { type: 'string', example: '#facc15' },
        },
      },
      /* ── Content ─────────────────────────────── */
      Content: {
        type: 'object',
        properties: {
          _id:             { $ref: '#/components/schemas/ObjectId' },
          user:            { $ref: '#/components/schemas/ObjectId' },
          type:            { type: 'string', enum: ['article','tweet','youtube','pdf','image','webpage','note'], example: 'article' },
          url:             { type: 'string', format: 'uri', example: 'https://example.com/article' },
          title:           { type: 'string', example: 'Understanding Vector Databases' },
          description:     { type: 'string', example: 'A deep dive into vector search.' },
          summary:         { type: 'string', example: 'AI-generated 2-3 sentence summary.' },
          tags:            { type: 'array', items: { type: 'string' }, example: ['AI', 'databases'] },
          manualTags:      { type: 'array', items: { type: 'string' } },
          category:        { type: 'string', example: 'technology' },
          keyInsights:     { type: 'array', items: { type: 'string' } },
          thumbnail:       { type: 'string', format: 'uri' },
          favicon:         { type: 'string', format: 'uri' },
          author:          { type: 'string' },
          siteName:        { type: 'string' },
          aiProcessed:     { type: 'boolean', example: true },
          aiProcessing:    { type: 'boolean', example: false },
          embeddingId:     { type: 'string' },
          collections:     { type: 'array', items: { $ref: '#/components/schemas/ObjectId' } },
          relatedItems:    { type: 'array', items: { $ref: '#/components/schemas/ObjectId' } },
          lastSurfaced:    { type: 'string', format: 'date-time' },
          viewCount:       { type: 'integer', example: 5 },
          isFavorite:      { type: 'boolean', example: false },
          isArchived:      { type: 'boolean', example: false },
          highlights:      { type: 'array', items: { $ref: '#/components/schemas/Highlight' } },
          readingProgress: { type: 'integer', minimum: 0, maximum: 100, example: 42 },
          createdAt:       { type: 'string', format: 'date-time' },
          updatedAt:       { type: 'string', format: 'date-time' },
        },
      },
      ContentInput: {
        type: 'object',
        required: ['type', 'title'],
        properties: {
          type:       { type: 'string', enum: ['article','tweet','youtube','pdf','image','webpage','note'], example: 'article' },
          url:        { type: 'string', format: 'uri', example: 'https://example.com/article' },
          title:      { type: 'string', example: 'Understanding Vector Databases' },
          description:{ type: 'string' },
          manualTags: { type: 'array', items: { type: 'string' } },
          notes:      { type: 'string' },
        },
      },
      ContentUpdateInput: {
        type: 'object',
        properties: {
          title:       { type: 'string' },
          description: { type: 'string' },
          manualTags:  { type: 'array', items: { type: 'string' } },
          notes:       { type: 'string' },
        },
      },
      /* ── Stats ───────────────────────────────── */
      Stats: {
        type: 'object',
        properties: {
          total:         { type: 'integer', example: 42 },
          aiProcessed:   { type: 'integer', example: 38 },
          favorites:     { type: 'integer', example: 7 },
          byType:        { type: 'object', additionalProperties: { type: 'integer' } },
          byCategory:    { type: 'object', additionalProperties: { type: 'integer' } },
          recentWeek:    { type: 'integer', example: 5 },
        },
      },
      /* ── Collection ──────────────────────────── */
      Collection: {
        type: 'object',
        properties: {
          _id:         { $ref: '#/components/schemas/ObjectId' },
          user:        { $ref: '#/components/schemas/ObjectId' },
          name:        { type: 'string', example: 'AI Research' },
          description: { type: 'string', example: 'Papers and articles on AI.' },
          color:       { type: 'string', example: '#f59e0b' },
          icon:        { type: 'string', example: '🤖' },
          items:       { type: 'array', items: { $ref: '#/components/schemas/ObjectId' } },
          createdAt:   { type: 'string', format: 'date-time' },
          updatedAt:   { type: 'string', format: 'date-time' },
        },
      },
      CollectionInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name:        { type: 'string', example: 'AI Research' },
          description: { type: 'string' },
          color:       { type: 'string', example: '#f59e0b' },
          icon:        { type: 'string', example: '🤖' },
        },
      },
      /* ── Error ───────────────────────────────── */
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Not authorised, no token' },
          stack:   { type: 'string' },
        },
      },
    },
  },
  paths: {
    /* ════════════════════════════════════════════
       HEALTH
    ════════════════════════════════════════════ */
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'API health check',
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status:    { type: 'string', example: 'ok' },
                    app:       { type: 'string', example: 'ToughtNet API' },
                    version:   { type: 'string', example: '1.0.0' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    /* ════════════════════════════════════════════
       AUTH
    ════════════════════════════════════════════ */
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } },
        },
        responses: {
          201: {
            description: 'User created and JWT cookie set',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          400: { description: 'Validation error / user already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT cookie',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
        },
        responses: {
          200: {
            description: 'Login successful, JWT httpOnly cookie set',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout — clears the JWT cookie',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated user\'s profile',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    /* ════════════════════════════════════════════
       CONTENT
    ════════════════════════════════════════════ */
    '/api/content': {
      get: {
        tags: ['Content'],
        summary: 'Get all saved content (paginated)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'page',     in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',    in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'type',     in: 'query', schema: { type: 'string', enum: ['article','tweet','youtube','pdf','image','webpage','note'] }, description: 'Filter by content type' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
          { name: 'favorite', in: 'query', schema: { type: 'boolean' }, description: 'Only favorites' },
          { name: 'archived', in: 'query', schema: { type: 'boolean' }, description: 'Only archived items' },
          { name: 'sort',     in: 'query', schema: { type: 'string', default: '-createdAt' }, description: 'Sort field, prefix - for desc' },
        ],
        responses: {
          200: {
            description: 'Paginated list of content',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    content: { type: 'array', items: { $ref: '#/components/schemas/Content' } },
                    page:    { type: 'integer' },
                    pages:   { type: 'integer' },
                    total:   { type: 'integer' },
                  },
                },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
      post: {
        tags: ['Content'],
        summary: 'Save new content and enqueue AI processing',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentInput' } } },
        },
        responses: {
          201: { description: 'Content saved', content: { 'application/json': { schema: { $ref: '#/components/schemas/Content' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/content/stats': {
      get: {
        tags: ['Content'],
        summary: 'Get content statistics for the dashboard',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Stats object', content: { 'application/json': { schema: { $ref: '#/components/schemas/Stats' } } } },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/content/resurface': {
      get: {
        tags: ['Content'],
        summary: 'Resurface random past memories (spaced-repetition style)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Array of resurfaced content', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Content' } } } } },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/content/{id}': {
      get: {
        tags: ['Content'],
        summary: 'Get a single content item by ID',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        responses: {
          200: { description: 'Content item', content: { 'application/json': { schema: { $ref: '#/components/schemas/Content' } } } },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
      put: {
        tags: ['Content'],
        summary: 'Update a content item',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentUpdateInput' } } },
        },
        responses: {
          200: { description: 'Updated content', content: { 'application/json': { schema: { $ref: '#/components/schemas/Content' } } } },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
      delete: {
        tags: ['Content'],
        summary: 'Delete a content item',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        responses: {
          200: { description: 'Deleted successfully' },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/content/{id}/highlight': {
      post: {
        tags: ['Content'],
        summary: 'Add a highlight to a content item',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/HighlightInput' } } },
        },
        responses: {
          201: { description: 'Highlight added', content: { 'application/json': { schema: { $ref: '#/components/schemas/Content' } } } },
          404: { description: 'Content not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/content/{id}/highlight/{highlightId}': {
      delete: {
        tags: ['Content'],
        summary: 'Remove a highlight from a content item',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id',          in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } },
          { name: 'highlightId', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } },
        ],
        responses: {
          200: { description: 'Highlight removed' },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/content/{id}/favorite': {
      patch: {
        tags: ['Content'],
        summary: 'Toggle favorite status',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        responses: {
          200: { description: 'Favorite toggled', content: { 'application/json': { schema: { $ref: '#/components/schemas/Content' } } } },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/content/{id}/archive': {
      patch: {
        tags: ['Content'],
        summary: 'Toggle archive status',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        responses: {
          200: { description: 'Archive toggled', content: { 'application/json': { schema: { $ref: '#/components/schemas/Content' } } } },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/content/{id}/progress': {
      patch: {
        tags: ['Content'],
        summary: 'Update reading progress (0–100)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['progress'],
                properties: { progress: { type: 'integer', minimum: 0, maximum: 100, example: 75 } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Progress updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Content' } } } },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    /* ════════════════════════════════════════════
       COLLECTIONS
    ════════════════════════════════════════════ */
    '/api/collections': {
      post: {
        tags: ['Collections'],
        summary: 'Create a new collection',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CollectionInput' } } },
        },
        responses: {
          201: { description: 'Collection created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Collection' } } } },
          400: { description: 'Validation error' },
          401: { description: 'Not authenticated' },
        },
      },
      get: {
        tags: ['Collections'],
        summary: 'Get all collections for the authenticated user',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'List of collections', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Collection' } } } } },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/collections/{id}': {
      get: {
        tags: ['Collections'],
        summary: 'Get a single collection by ID',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        responses: {
          200: { description: 'Collection detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/Collection' } } } },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
      put: {
        tags: ['Collections'],
        summary: 'Update a collection',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CollectionInput' } } },
        },
        responses: {
          200: { description: 'Updated collection', content: { 'application/json': { schema: { $ref: '#/components/schemas/Collection' } } } },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
      delete: {
        tags: ['Collections'],
        summary: 'Delete a collection',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        responses: {
          200: { description: 'Deleted successfully' },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/collections/{id}/add': {
      post: {
        tags: ['Collections'],
        summary: 'Add a content item to a collection',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['contentId'],
                properties: { contentId: { $ref: '#/components/schemas/ObjectId' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Content added to collection' },
          404: { description: 'Collection or content not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/collections/{id}/remove/{contentId}': {
      delete: {
        tags: ['Collections'],
        summary: 'Remove a content item from a collection',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id',        in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } },
          { name: 'contentId', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } },
        ],
        responses: {
          200: { description: 'Content removed from collection' },
          404: { description: 'Not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    /* ════════════════════════════════════════════
       SEARCH
    ════════════════════════════════════════════ */
    '/api/search': {
      get: {
        tags: ['Search'],
        summary: 'Full-text & semantic search across saved content',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'q',     in: 'query', required: true, schema: { type: 'string' }, description: 'Search query', example: 'vector database' },
          { name: 'type',  in: 'query', schema: { type: 'string', enum: ['article','tweet','youtube','pdf','image','webpage','note'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Search results', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Content' } } } } },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/search/tags': {
      get: {
        tags: ['Search'],
        summary: 'Get all unique tags used by the authenticated user',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Sorted list of tags',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'string' }, example: ['AI', 'databases', 'tools'] } } },
          },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/search/graph': {
      get: {
        tags: ['Search'],
        summary: 'Get graph data (nodes & edges) for the knowledge graph view',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Graph nodes and edges',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nodes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id:    { type: 'string' },
                          label: { type: 'string' },
                          type:  { type: 'string', enum: ['content', 'tag'] },
                          data:  { type: 'object' },
                        },
                      },
                    },
                    edges: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id:     { type: 'string' },
                          source: { type: 'string' },
                          target: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/search/related/{id}': {
      get: {
        tags: ['Search'],
        summary: 'Get semantically related content for a given content item',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }],
        responses: {
          200: { description: 'Related content items', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Content' } } } } },
          404: { description: 'Content not found' },
          401: { description: 'Not authenticated' },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [], // All definitions are inline above
};

export const swaggerSpec = swaggerJSDoc(options);
