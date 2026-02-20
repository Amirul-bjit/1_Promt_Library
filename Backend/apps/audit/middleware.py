"""
Audit middleware for tracking API requests
"""
from django.utils.deprecation import MiddlewareMixin
from .models import AuditLog


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware to log all API requests
    """
    
    def process_request(self, request):
        # Store original data for later comparison
        request._audit_data = {
            'user': request.user if request.user.is_authenticated else None,
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'method': request.method,
            'path': request.path,
        }
        return None

    def process_response(self, request, response):
        # Only log successful mutations (POST, PUT, PATCH, DELETE)
        if hasattr(request, '_audit_data') and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if 200 <= response.status_code < 300:
                self.log_request(request, response)
        return response

    def log_request(self, request, response):
        """
        Create audit log entry for the request
        """
        audit_data = request._audit_data
        action_map = {
            'POST': AuditLog.ACTION_CREATE,
            'PUT': AuditLog.ACTION_UPDATE,
            'PATCH': AuditLog.ACTION_UPDATE,
            'DELETE': AuditLog.ACTION_DELETE,
        }
        
        AuditLog.objects.create(
            user=audit_data['user'],
            action=action_map.get(audit_data['method'], AuditLog.ACTION_CREATE),
            ip_address=audit_data['ip_address'],
            user_agent=audit_data['user_agent'],
            extra={
                'path': audit_data['path'],
                'method': audit_data['method'],
                'status_code': response.status_code,
            }
        )

    @staticmethod
    def get_client_ip(request):
        """
        Get the client IP address from the request
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
