using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProEventos.API.Extensions;
using ProEventos.Application.Contratos;
using ProEventos.Application.Dtos;

namespace ProEventos.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        public UserController(IUserService userService, 
                              ITokenService tokenService)
        {
            _userService = userService;
            _tokenService = tokenService;
        }

        [HttpGet("GetUser")]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                var userName = User.GetUserName();
                var user = await _userService.GetUserByUserNameAsync(userName);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                $"Erro ao tentar recuperar usuário. Erro: {ex.Message}");
            }

        }

        [HttpPost("Register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(UserDto userDto)
        {
            try
            {
                if (await _userService.UserExists(userDto.UserName))
                    return BadRequest("Usuário já existe.");

                var user = await _userService.CreateAccountAsync(userDto);
                if (user != null)
                    return Ok(user);
                
                return BadRequest("Usuário não criado, tente novamente mais tarde!");
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                $"Erro ao tentar registrar usuário. Erro: {ex.Message}");
            }
        }

        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(UserLoginDto userLogin)
        {
            try
            {
                //evita duas chamadas desnecessárias no banco de dados (se o usuário já existe, retorna)
                var user = await _userService.GetUserByUserNameAsync(userLogin.UserName);
                if (user == null) return Unauthorized("Usuário ou senha inválido.");

                var result = await _userService.CheckUserPasswordAsync(user, userLogin.Password);
                if (!result.Succeeded) return Unauthorized();

                return Ok 
                ( 
                    new 
                    {
                        userName = user.UserName,
                        PrimeiroNome = user.PrimeiroNome,
                        token = _tokenService.CreteToken(user).Result
                    }
                );
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                $"Erro ao tentar realizar login. Erro: {ex.Message}");
            }
        }

        [HttpPut("UpdateUser")]
        public async Task<IActionResult> Register(UserUpdateDto userUpdateDto)
        {
            try
            {
                var user = await _userService.GetUserByUserNameAsync(User.GetUserName());
                if (user == null) return Unauthorized("Usuário inválido.");

                var userReturn = await _userService.UpdateAccount(userUpdateDto);
                if (userReturn == null) return NoContent();

                return Ok(userReturn);
            }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                $"Erro ao tentar atualizar usuário. Erro: {ex.Message}");
            }
        }
    }
}