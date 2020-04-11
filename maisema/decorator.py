from django.conf import settings
from django.http import HttpResponseBadRequest

def sanitize_url_path(func):
    def decorator(request, *args, **kwargs):
        path_parts_set = set(kwargs.get('url_path', 'root').split(settings.PATH_SEPERATOR))

        if '..' in path_parts_set or '.' in path_parts_set:
            return HttpResponseBadRequest()
        return func(request, *args, **kwargs)

    return decorator