from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class PublicUserSerializer(serializers.ModelSerializer):
    is_profile_complete = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "city",
            "pincode",
            "is_worker",
            "is_active",
            "is_profile_complete",
        ]
        read_only_fields = ["id", "email", "is_active", "is_profile_complete"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "city",
            "pincode",
            "is_worker",
            "password",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class ProfileSerializer(PublicUserSerializer):
    class Meta(PublicUserSerializer.Meta):
        read_only_fields = [
            "id",
            "email",
            "is_active",
            "is_worker",
            "is_profile_complete",
        ]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = PublicUserSerializer(self.user).data
        return data


class AuthResponseSerializer(serializers.Serializer):
    user = PublicUserSerializer()
    refresh = serializers.CharField()
    access = serializers.CharField()

    @staticmethod
    def for_user(user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        return {
            "user": PublicUserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
